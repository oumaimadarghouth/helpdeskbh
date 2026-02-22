from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def send_set_password_email(*, email: str, first_name: str = "", link: str):
    subject = "Activer votre compte - BH HelpDesk"
    from_email = settings.DEFAULT_FROM_EMAIL

    context = {
        "first_name": first_name or "Utilisateur",
        "link": link,
        "ttl_minutes": 60,
        "company": "BH Assurance",
    }

    text_content = render_to_string("emails/set_password.txt", context)
    html_content = render_to_string("emails/set_password.html", context)

    msg = EmailMultiAlternatives(
        subject,
        text_content,
        from_email,
        [email]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)
