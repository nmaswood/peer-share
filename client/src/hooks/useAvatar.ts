import chicken from '../assets/chicken.png';
import rabbit from '../assets/rabbit.png';
import dog from '../assets/dog.png';
import fox from '../assets/fox.png';
import seaLion from '../assets/sea-lion.png';
import meerkat from '../assets/meerkat.png';
import panda from '../assets/panda.png';
import bear from '../assets/bear.png';
import { useRef } from 'react';

export const avatars: AvatarData[] = [
	{ name: 'Chicken', src: chicken },
	{ name: 'Rabbit', src: rabbit },
	{ name: 'Dog', src: dog },
	{ name: 'Fox', src: fox },
	{ name: 'Sea Lion', src: seaLion },
	{ name: 'Meerkat', src: meerkat },
	{ name: 'Panda', src: panda },
	{ name: 'Bear', src: bear },
];

interface AvatarData {
	name: string;
	src: string;
}

const useAvatar = (): AvatarData => {
	const avatarRef = useRef<AvatarData | null>(null);
	if (!avatarRef.current) {
		const randomIndex = Math.floor(Math.random() * avatars.length);
		avatarRef.current = avatars[randomIndex];
	}
	return avatarRef.current;
};

export default useAvatar;
