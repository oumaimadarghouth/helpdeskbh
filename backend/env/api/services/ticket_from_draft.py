# api/services/ticket_from_draft.py
from api.models import Ticket

def create_ticket_from_draft(user, draft):
    ticket = Ticket.objects.create(
        created_by=user,
        title=draft.title,
        category=draft.category,
        priority=draft.priority,
        impact=draft.impact,
        description=draft.description,
        status="OPEN",
    )
    return ticket
    from api.models import Ticket

def create_ticket_from_draft(user, draft):
    ticket = Ticket.objects.create(
        created_by=user,
        title=draft.title,
        category=draft.category,
        priority=draft.priority,
        impact=draft.impact,
        description=draft.description,
        status="OPEN",
    )
    return ticket