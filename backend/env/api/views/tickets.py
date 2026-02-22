# api/views/tickets.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models import ChatSession
from api.services.ticket_from_draft import create_ticket_from_draft

class TicketFromDraft(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get("session_id")
        session = ChatSession.objects.get(id=session_id, user=request.user)
        draft = session.draft

        if not draft.is_complete():
            return Response({"detail": "Draft incomplet"}, status=400)

        t = create_ticket_from_draft(request.user, draft)
        session.state = "DONE"
        session.save(update_fields=["state"])
        return Response({"ticket_id": t.id}, status=201)
