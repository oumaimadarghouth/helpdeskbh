import re

CATEGORIES = {
    "login": "AUTH",
    "connexion": "AUTH",
    "mot de passe": "AUTH",
    "pc": "IT_HARDWARE",
    "imprimante": "IT_HARDWARE",
    "bug": "BUG",
    "erreur": "BUG",
    "réseau": "NETWORK",
    "internet": "NETWORK",
}

def infer_category(text: str) -> str:
    t = text.lower()
    for k, v in CATEGORIES.items():
        if k in t:
            return v
    return ""

def infer_priority(impact: str) -> str:
    # banque: logique simple (tu ajusteras)
    if impact == "BRANCH":
        return "P1"
    if impact == "TEAM":
        return "P2"
    if impact == "ONE_USER":
        return "P3"
    return ""

def build_title(text: str) -> str:
    t = text.strip()
    return (t[:80] + "…") if len(t) > 80 else t

def needs_more_info(draft) -> list[str]:
    missing = []
    if not draft.description: missing.append("description")
    if not draft.impact: missing.append("impact")
    if not draft.category: missing.append("category")
    if not draft.priority: missing.append("priority")
    if not draft.title: missing.append("title")
    return missing

def next_question(missing: list[str]) -> str:
    if "description" in missing:
        return "Décris le problème en détail (message d’erreur, application, étape où ça bloque)."
    if "impact" in missing:
        return "Quel est l’impact ? (1=Moi seul, 2=Mon équipe, 3=Une agence entière)"
    if "category" in missing:
        return "C’est plutôt : (1=Connexion/Compte, 2=Matériel PC/Imprimante, 3=Réseau, 4=Bug application) ?"
    if "priority" in missing:
        return "C’est bloquant ? (1=Oui bloquant, 2=Partiel, 3=Non)"
    if "title" in missing:
        return "Donne un titre court pour le ticket."
    return "Je peux créer le ticket. Tu confirmes ?"
