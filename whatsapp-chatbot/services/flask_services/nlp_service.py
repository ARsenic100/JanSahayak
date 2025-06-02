import spacy
from spacy.matcher import PhraseMatcher
from collections import defaultdict

# Load spaCy model with word vectors
nlp = spacy.load("en_core_web_md")  # use "md" or "lg" for better vector support

# Define expanded keyword sets for each urgency level
# Define expanded keyword sets for each urgency level and department

HIGH_URGENCY_PHRASES = [
    # Water
    "water pipeline burst", "water flooding the street", "no water in the entire area",
    "contaminated drinking water", "water gushing from main pipe", "sewage mixing in drinking water",
    "tank overflow causing damage",

    # Electricity
    "electric shock incident", "power line fell on road", "short circuit with sparks",
    "transformer blast", "exposed live wire", "fire due to electricity",

    # Roads
    "road collapsed", "deep potholes causing accidents", "major road blockage",
    "manhole open in middle of road", "construction debris causing danger",

    # Sanitation
    "open defecation in locality", "biohazard waste dumped publicly",
    "sewage water entering homes", "foul smell causing health issue", "overflowing septic tank",

    # Garbage Collection
    "rotting garbage attracting dogs and insects", "garbage heap blocking the road",
    "medical waste dumped publicly", "burning garbage causing suffocation",

    # Street Lights
    "electric pole sparking", "short circuit in light", "street light exploded",

    # Drainage
    "drain overflow into homes", "sewage water flooding street", "open drain near school",
    "foul water spreading disease",

    # Public Toilets
    "people fainted due to toilet smell", "unhygienic toilet causing illness",
    "no water in toilet leading to public nuisance", "broken toilet exposing waste",

    # Other
    "fire incident", "explosion", "animal attack reported", "serious public safety threat",
    "gas leak from nearby shop", "collapsed wall on footpath", "building about to collapse",
    "major chemical smell in area", "fight breaking out in public", "gunshot heard nearby",
    "gas cylinder blast", "hazardous chemical spill", "ceiling collapse", "tree fell on someone",
    "roof collapsed", "aggressive mob gathering", "people electrocuted", "unattended body on road",
    "fatal accident on main road", "shooting incident", "bridge crack observed"
]

MEDIUM_URGENCY_PHRASES = [
    # Water
    "water leakage from pipe", "low water pressure", "tap not working",
    "water supply irregular", "pipeline damaged", "water supply only at night",

    # Electricity
    "complete power outage", "fluctuating voltage", "low voltage issue",
    "frequent power cuts", "meter not working", "fuse blown", "electric pole damaged",

    # Roads
    "potholes damaging vehicles", "broken road divider", "footpath broken",
    "speed bump needed", "illegal road encroachment",

    # Sanitation
    "toilet cleaning not done", "dirty community toilets", "clogged bathroom drain",
    "blocked toilet in public area", "waste water stagnant in colony",

    # Garbage Collection
    "garbage van not coming for days", "overflowing bin in locality",
    "stray animals scattering trash", "waste pile in market area", "improper segregation complaint",

    # Street Lights
    "entire street dark", "multiple lights not working", "light pole fallen",
    "damaged electrical wiring", "delay in night lighting",

    # Drainage
    "drain clogged with plastic", "manhole cover missing", "poor drain slope",
    "water standing in drains", "partial blockage",

    # Public Toilets
    "toilet door broken", "no electricity inside toilet", "no flush system working",
    "unclean urinals", "used sanitary pads not cleared",

    # Other
    "unauthorized construction", "encroachment on government land",
    "street vendor blocking passage", "abandoned vehicle", "noise pollution late night",
    "cow or buffalo blocking traffic", "temporary tent obstructing path",
    "construction material on footpath", "drunk person creating scene", "illegal parking causing jam",
    "open borewell", "construction without permit", "children playing on highway",
    "beggars harassing public", "animal carcass on road", "temporary stage blocking main road",
    "small fire near garbage", "rickshaw obstruction at junction"
]

LOW_URGENCY_PHRASES = [
    # Water
    "slightly muddy water", "dripping tap", "slow water flow", "request for water tanker",
    "dirty water in overhead tank",

    # Electricity
    "fan not working", "old meter box open", "request for new connection",
    "power on-off issue occasionally", "noisy transformer",

    # Roads
    "uneven road", "minor cracks", "road needs painting", "broken footpath tile",
    "slippery surface after rain",

    # Sanitation
    "bad odor near homes", "insects in wash area", "toilet needs phenyl cleaning",
    "delay in cleaning toilet", "need new toilet seat",

    # Garbage Collection
    "garbage smell", "small trash accumulation", "need more bins in area",
    "bin broken or dirty", "request for dry waste pickup",

    # Street Lights
    "flickering light", "bulb fused", "request for new street light",
    "light not working in front of house", "light cover broken",

    # Drainage
    "smelly drain", "request for cleaning drain", "mosquito breeding in drain",
    "slow water flow in drain",

    # Public Toilets
    "bad odor in toilet", "request for cleaning staff", "toilet tiles broken",
    "lack of soap or sanitizer", "complaint about toilet design",

    # Other
    "street artist causing crowd", "request for tree trimming",
    "complaint about stray dogs", "dog poop in park", "poster litter on walls",
    "hawkers on footpath", "walls being used for urination", "idle vehicles parked long-term",
    "community radio playing loudly", "posters defacing public property",
    "need for dog sterilization", "street children loitering", "request for more traffic signs",
    "temporary wires hanging", "request for community notice board", "street bench broken"
]

# Create phrase matchers
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")

# Add patterns to matcher
def add_phrases(phrases, label):
    patterns = [nlp.make_doc(phrase) for phrase in phrases]
    matcher.add(label, patterns)

add_phrases(HIGH_URGENCY_PHRASES, "HIGH")
add_phrases(MEDIUM_URGENCY_PHRASES, "MEDIUM")
add_phrases(LOW_URGENCY_PHRASES, "LOW")

# Fallback semantic similarity terms
ALL_URGENCY_DICT = {
    "HIGH": HIGH_URGENCY_PHRASES,
    "MEDIUM": MEDIUM_URGENCY_PHRASES,
    "LOW": LOW_URGENCY_PHRASES
}

def classify_text_urgency(text):
    doc = nlp(text.lower())

    # Use PhraseMatcher
    matches = matcher(doc)
    scores = defaultdict(int)

    for match_id, start, end in matches:
        label = nlp.vocab.strings[match_id]
        scores[label] += 1

    if scores:
        # Prioritize High > Medium > Low
        if scores["HIGH"]: return "High"
        elif scores["MEDIUM"]: return "Medium"
        elif scores["LOW"]: return "Low"

    # If no exact match, fallback to semantic similarity
    similarity_scores = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for token in doc:
        if token.is_stop or token.is_punct:
            continue
        for urgency, phrases in ALL_URGENCY_DICT.items():
            for phrase in phrases:
                phrase_doc = nlp(phrase)
                similarity = token.similarity(phrase_doc)
                if similarity > 0.75:  # tuned threshold
                    similarity_scores[urgency] += similarity

    if max(similarity_scores.values()) > 0:
        return max(similarity_scores, key=similarity_scores.get).capitalize()

    return "Low"  # Default to Low if no match

