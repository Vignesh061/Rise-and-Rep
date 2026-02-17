RECOMMENDATIONS = {
    "weight_loss": [
        {"exercise": "Running", "sets": 1, "reps": 1, "duration": "30 min", "notes": "Moderate pace"},
        {"exercise": "Jump Rope", "sets": 5, "reps": 50, "duration": "15 min", "notes": "High intensity"},
        {"exercise": "Burpees", "sets": 4, "reps": 15, "duration": "10 min", "notes": "Full body cardio"},
    ],
    "muscle_gain": [
        {"exercise": "Bench Press", "sets": 4, "reps": 8, "weight": "70% 1RM", "notes": "Chest day"},
        {"exercise": "Squats", "sets": 4, "reps": 8, "weight": "75% 1RM", "notes": "Leg day"},
        {"exercise": "Deadlifts", "sets": 3, "reps": 6, "weight": "80% 1RM", "notes": "Back day"},
    ],
    "flexibility": [
        {"exercise": "Yoga Flow", "sets": 1, "reps": 1, "duration": "30 min", "notes": "Full body stretch"},
        {"exercise": "Foam Rolling", "sets": 1, "reps": 1, "duration": "15 min", "notes": "Recovery"},
        {"exercise": "Dynamic Stretches", "sets": 3, "reps": 10, "duration": "10 min", "notes": "Pre-workout"},
    ],
    "endurance": [
        {"exercise": "Cycling", "sets": 1, "reps": 1, "duration": "45 min", "notes": "Steady state"},
        {"exercise": "Swimming", "sets": 1, "reps": 1, "duration": "30 min", "notes": "Full body cardio"},
        {"exercise": "Rowing", "sets": 1, "reps": 1, "duration": "20 min", "notes": "High intensity"},
    ],
}


def get_recommendations(goal="muscle_gain"):
    """Return workout recommendations for the given goal."""
    return RECOMMENDATIONS.get(goal, RECOMMENDATIONS["muscle_gain"])
