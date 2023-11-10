import React, { useEffect, useRef, useState } from 'react';
import bgmusic from '../assets/musics/bg-music.mp3';
import '../assets/styles/BackgroundMusic.scss'; // Assurez-vous d'importer le fichier CSS

const BackgroundMusic = () => {
    const [volume, setVolume] = useState<number>(0.5);
    const audioRef = useRef(new Audio(bgmusic));

    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = volume;

        audio.loop = true;
        audio.play().catch((error) => {
            // Gérer les erreurs liées à la lecture audio
            console.error("Erreur de lecture audio:", error);
        });

        return () => {
            audio.pause();
        };
    }, [volume]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    return (
        <div className="retro-volume-control">
            <label htmlFor="volume">Game volume:</label>
            <input
                type="range"
                id="volume"
                name="volume"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
            />
        </div>
    );
};

export default BackgroundMusic;
