import {ClassroomUserProfile} from "./types";
import { StudentProfile} from "dt-types";

const translit = require('translitit-latin-to-mkhedruli-georgian')

export class Profile implements  StudentProfile {
	id: string
	georgianName: string
	emailId: string
	emailAddress: string
	constructor(p: ClassroomUserProfile) {
		this.id = p.id!
		this.emailId = p.emailAddress?.match(/(.*)@/)![1]! // ეს ბოლო ძახილის ნიშანი იმიტომაა რომ @ ყოველთვის იქნება
		this.georgianName = translitName(p.name?.givenName)
		this.emailAddress = p.emailAddress!
	}
}


function translitName(latinName?: string): string {
	const nameInGeorgian = translit(latinName)
	const matches = replace.find(e => nameInGeorgian.includes(e[0]))
	return matches ?
		nameInGeorgian.replace(matches[0], matches[1])
		: nameInGeorgian
}

const replace = [
	['ტამარ', 'თამარ'],
	['ტაკ', 'თაკ'],
	['დატო', 'დათო'],
	['დავიტ', 'დავით'],
	['ტეიმურაზ', 'თეიმურაზ'],
	['გვანწა', 'გვანცა'],
	['ოტარ', 'ოთარ'],
	['ლეკს', 'ლექს'],
	['ტორნიკე', 'თორნიკე'],
	['კეტ', 'ქეთ'],
	['ტეკლ', 'თეკლ'],
	['სოპ', 'სოფ'],
	['ტატია', 'თათია'],
	['ნუწ', 'ნუც'],
	['წოტნ', 'ცოტნ'],
	['ტინატინ', 'თინათინ'],
	['ტინა', 'თინა'],
	['ნინწა', 'ნინცა'],
	['ტეო', 'თეო'],
	['ტეა', 'თეა'],
	['ავტ', 'ავთ'],
	['ტამაზ', 'თამაზ'],
	['ნატია', 'ნათია'],
	['დაჭი', 'დაჩი'],
	['არჭილ', 'არჩილ'],
	['ტენგიზი', 'თენგიზ'],
	['ბეკა', 'ბექა'],
	['ტაზო', 'თაზო'],
	['მატე', 'მათე'],
	['ელიზაბეთ', 'ელისაბედ']
]

