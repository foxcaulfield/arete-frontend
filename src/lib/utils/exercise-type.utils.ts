export function getTypeIcon(type: Exercise.ExerciseType) {
	const icons: Record<Exercise.ExerciseType | "default", string> = {
		FILL_IN_THE_BLANK: `
 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="3" y="4" width="18" height="16" rx="2" stroke="#444444" stroke-width="1.5" fill="none"></rect>
 <path d="M7 8h10M7 12h6" stroke="#444444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
 </svg>
 `,
		CHOICE_SINGLE: `
 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <circle cx="6.5" cy="7.5" r="1.5" stroke="#444444" stroke-width="1.5" fill="none" />
 <circle cx="6.5" cy="12" r="1.5" stroke="#444444" stroke-width="1.5" fill="none" />
 <circle cx="6.5" cy="16.5" r="1.5" stroke="#444444" stroke-width="1.5" fill="none" />
 <path d="M9 7.5h9M9 12h9M9 16.5h9" stroke="#444444" stroke-width="1.5" stroke-linecap="round" />
 </svg>
 `,
		default: `
 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <circle cx="12" cy="12" r="9" stroke="#444444" stroke-width="1.5" fill="none"></circle>
 <path d="M9.5 9.5a2.5 2.5 0 115 0c0 2-2 2.5-2 3" stroke="#444444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
 <path d="M12 17v.01" stroke="#444444" stroke-width="1.5" stroke-linecap="round" />
 </svg>
 `,
	};
	return icons[type] ?? icons.default;
}

export function getTypeLabel(type: Exercise.ExerciseType) {
	switch (type) {
		case "CHOICE_SINGLE":
			return "Single choice";
		case "FILL_IN_THE_BLANK":
			return "Fill in the blank";
		default:
			return String(type || "Unknown");
	}
}

export function getTypeDesc(type: Exercise.ExerciseType) {
	switch (type) {
		case "CHOICE_SINGLE":
			return "Choose one option.";
		case "FILL_IN_THE_BLANK":
			return "Fill in the blank.";
		default:
			return "Question type information.";
	}
}
