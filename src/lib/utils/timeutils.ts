function sortStringsByFloats(strings: string[], floats: number[]) {
	// Create an object that maps each string to its corresponding float value
	const stringToFloatMap = strings.reduce((map: { [key: string]: number }, str, index) => {
		map[str] = floats[index];
		return map;
	}, {});

	// Sort
	return strings.sort((a, b) => stringToFloatMap[b] - stringToFloatMap[a]);
}

function getReadableDateTime(utcString: string): string {
	const date = new Date(utcString);
	// const hours = date.getHours();
	// const minutes = date.getMinutes();
	// const ampm = hours >= 12 ? 'PM' : 'AM';
	// const hours12 = hours % 12;
	// const timeString = `${hours12.toString().padStart(2, '0')}:${minutes
	// 	.toString()
	// 	.padStart(2, '0')} ${ampm}`;
	const month = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	const monthName = month[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const dayOfWeek = daysOfWeek[date.getDay()];
	const dateString = `${dayOfWeek} ${day} ${monthName}, ${year}`;
	return `${dateString}`;
}

function getStartOfWeek(date: Date) {
	const day = date.getDay();
	const diff = date.getDate() - day + (day === 0 ? -6 : 1);
	return new Date(date.setDate(diff));
}

function getEndOfWeek(date: Date) {
	const day = date.getDay();
	const diff = date.getDate() + ((7 - day) % 7);
	return new Date(date.setDate(diff));
}

function evalTimePeriod(utcString: string, chosenTimePeriod: string) {
	const utcDate = new Date(utcString);
	const now = new Date();

	if (chosenTimePeriod === 'this week') {
		const startOfWeek = getStartOfWeek(now);
		const endOfWeek = getEndOfWeek(now);
		const utcDay = new Date(
			Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate())
		);

		return utcDay >= startOfWeek && utcDay <= endOfWeek;
	}

	if (chosenTimePeriod === 'monday') {
		const utcDay = utcDate.getUTCDay();
		return utcDay === 1;
	}
	if (chosenTimePeriod === 'tuesday') {
		const utcDay = utcDate.getUTCDay();
		return utcDay === 2;
	}
	if (chosenTimePeriod === 'wednesday') {
		const utcDay = utcDate.getUTCDay();
		return utcDay === 3;
	}
	if (chosenTimePeriod === 'thursday') {
		const utcDay = utcDate.getUTCDay();
		return utcDay === 4;
	}
	if (chosenTimePeriod === 'friday') {
		const utcDay = utcDate.getUTCDay();
		return utcDay === 5;
	}
	if (chosenTimePeriod === 'saturday') {
		const utcDay = utcDate.getUTCDay();
		return utcDay === 6;
	}
	if (chosenTimePeriod === 'sunday') {
		const utcDay = utcDate.getUTCDay();
		return utcDay === 0;
	}

	if (chosenTimePeriod === 'january') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 0;
	}
	if (chosenTimePeriod === 'february') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 1;
	}
	if (chosenTimePeriod === 'march') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 2;
	}
	if (chosenTimePeriod === 'april') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 3;
	}
	if (chosenTimePeriod === 'may') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 4;
	}
	if (chosenTimePeriod === 'june') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 5;
	}
	if (chosenTimePeriod === 'july') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 6;
	}
	if (chosenTimePeriod === 'august') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 7;
	}
	if (chosenTimePeriod === 'september') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 8;
	}

	if (chosenTimePeriod === 'october') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 9;
	}

	if (chosenTimePeriod === 'november') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 10;
	}

	if (chosenTimePeriod === 'december') {
		const utcMonth = utcDate.getUTCMonth();
		return utcMonth === 11;
	}

	if (chosenTimePeriod === 'this month') {
		const thisMonth = now.getMonth();
		const utcMonth = utcDate.getUTCMonth();

		return thisMonth === utcMonth;
	}

	if (chosenTimePeriod === 'this year') {
		const thisYear = now.getFullYear();
		const utcYear = utcDate.getUTCFullYear();

		return thisYear === utcYear;
	}

	if (chosenTimePeriod === 'today') {
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const utcDay = new Date(
			Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate())
		);

		return utcDay.getTime() === today.getTime();
	}
	return false;
}

export { sortStringsByFloats, getReadableDateTime, evalTimePeriod };
