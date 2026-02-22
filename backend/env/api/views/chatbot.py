from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from api.models import ChatSession, ChatMessage, TicketDraft
from api.serializers.chatbot import ChatRequestSerializer
from api.services.chat_engine import infer_category, infer_priority, build_title, needs_more_info, next_question
from api.services.ticket_from_draft import create_ticket_from_draft

IMPACT_MAP = {"1": "ONE_USER", "2": "TEAM", "3": "BRANCH"}
BLOCKING_MAP = {"1": "P1", "2": "P2", "3": "P3"}
CATEGORY_MAP = {"1": "AUTH", "2": "IT_HARDWARE", "3": "NETWORK", "4": "BUG"}
YES = {"oui", "yes", "y", "ok", "daccord", "d'accord"}
NO  = {"non", "no", "n"}

class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = ChatRequestSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        msg = s.validated_data["message"].strip()
        session_id = s.validated_data.get("session_id")

        # 1) get/create session + draft
        if session_id:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        else:
            session = ChatSession.objects.create(user=request.user)
            TicketDraft.objects.create(session=session)

        draft = session.draft

        # 2) save user message
        ChatMessage.objects.create(session=session, role="user", content=msg)

        # 3) ✅ HANDLE CONFIRMATION FIRST
        if session.state == "CONFIRM_CREATE":
            low = msg.lower().strip()

            if low in YES:
                if not draft.is_complete():
                    session.state = "COLLECTING"
                    session.save(update_fields=["state"])
                    assistant = "Le ticket n’est pas complet. Donne-moi plus de détails (description/impact)."
                    ChatMessage.objects.create(session=session, role="assistant", content=assistant)
                    return Response({
                        "session_id": session.id,
                        "assistant_message": assistant,
                        "actions": ["ask_more_info"],
                    })

                ticket = create_ticket_from_draft(request.user, draft)

                session.state = "DONE"
                session.save(update_fields=["state"])

                assistant = f"✅ Ticket créé avec succès. ID = {ticket.id}. Un agent va le traiter."
                ChatMessage.objects.create(session=session, role="assistant", content=assistant)

                return Response({
                    "session_id": session.id,
                    "assistant_message": assistant,
                    "actions": ["ticket_created"],
                    "ticket_id": ticket.id
                })

            if low in NO:
                session.state = "COLLECTING"
                session.save(update_fields=["state"])

                assistant = "OK. Dis-moi ce que tu veux modifier (description, impact, priorité, catégorie)."
                ChatMessage.objects.create(session=session, role="assistant", content=assistant)

                return Response({
                    "session_id": session.id,
                    "assistant_message": assistant,
                    "actions": ["edit_draft"]
                })

            # if neither yes nor no
            assistant = "Réponds par 'oui' pour créer le ticket, ou 'non' pour modifier."
            ChatMessage.objects.create(session=session, role="assistant", content=assistant)
            return Response({
                "session_id": session.id,
                "assistant_message": assistant,
                "actions": ["confirm_create_ticket"]
            })

        # 4) normal slot filling
        if not draft.description and len(msg) >= 10:
            draft.description = msg

        if not draft.title:
            draft.title = build_title(msg)

        if not draft.category:
            cat = infer_category(msg)
            if cat:
                draft.category = cat

        # parse quick answers
        if msg in IMPACT_MAP:
            draft.impact = IMPACT_MAP[msg]
        if msg in CATEGORY_MAP:
            draft.category = CATEGORY_MAP[msg]
        if msg in BLOCKING_MAP:
            draft.priority = BLOCKING_MAP[msg]

        if not draft.priority and draft.impact:
            p = infer_priority(draft.impact)
            if p:
                draft.priority = p

        draft.save()

        # 5) ask next question or confirm
        missing = needs_more_info(draft)
        if not missing:
            session.state = "CONFIRM_CREATE"
            session.save(update_fields=["state"])

            assistant = (
                f"Résumé ticket:\n"
                f"- Titre: {draft.title}\n"
                f"- Catégorie: {draft.category}\n"
                f"- Priorité: {draft.priority}\n"
                f"- Impact: {draft.impact}\n\n"
                f"Je crée le ticket ? (oui/non)"
            )
            ChatMessage.objects.create(session=session, role="assistant", content=assistant)
            return Response({
                "session_id": session.id,
                "assistant_message": assistant,
                "draft_ticket": {
                    "title": draft.title,
                    "category": draft.category,
                    "priority": draft.priority,
                    "impact": draft.impact,
                    "description": draft.description,
                },
                "actions": ["confirm_create_ticket"]
            })

        assistant = next_question(missing)
        ChatMessage.objects.create(session=session, role="assistant", content=assistant)
        return Response({
            "session_id": session.id,
            "assistant_message": assistant,
            "draft_ticket": {
                "title": draft.title,
                "category": draft.category,
                "priority": draft.priority,
                "impact": draft.impact,
                "description": draft.description,
            },
            "actions": ["ask_more_info"]
        })
