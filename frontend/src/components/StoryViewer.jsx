import React, { useEffect, useState } from 'react';
import { BadgeCheck, X } from 'lucide-react';

const StoryViewer = ({ viewStory, setViewStory }) => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        let timer, progressInterval;

        if(viewStory && viewStory.media_type !== 'video') {
            setProgress(0);

            const duration = 10000;
            const setTime = 100;
            let elapsed = 0;

            progressInterval = setInterval(() => {
                elapsed += setTime;
                setProgress((elapsed / duration) * 100)
            }, [setTime]) 
            timer = setTimeout(() => {
                setViewStory(null)
            }, duration)
        }
        return () => {
            clearTimeout(timer)
            clearInterval(progressInterval)
        }
    }, [viewStory, setViewStory])

    const handleClose = () => {
        setViewStory(null);
    };

    const renderContent = () => {
        switch (viewStory?.media_type) {
            case 'image':
                return (
                    <img 
                        src={viewStory.media_url} 
                        alt="" 
                        className='max-w-full max-h-screen object-contain' 
                    />
                );
            case 'video':
                return (
                    <video 
                        onEnded={() => setViewStory(null)} 
                        src={viewStory.media_url} 
                        className='max-h-screen'
                        autoPlay
                        controls
                    />
                );
            case 'text':
                return (
                    <div 
                        className='w-full max-w-md aspect-[9/16] flex items-center justify-center p-8 text-white text-2xl text-center rounded-2xl shadow-2xl m-4'
                        style={{ backgroundColor: viewStory.background_color || '#4f46e5' }}
                    >
                        {viewStory.content}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className='fixed inset-0 h-screen bg-black z-110 flex items-center justify-center'>
            
            {/* Progress Bar */}
            <div className='absolute top-0 left-0 w-full h-1 bg-gray-700/50'>
                <div 
                    className='h-full bg-white transition-all duration-100 linear' 
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* User Info - Pushed away from the top-left corner */}
            <div className='absolute top-8 left-8 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50 z-10'>
                <img 
                    src={viewStory.user?.profile_picture} 
                    alt="" 
                    className='size-7 sm:size-8 rounded-full object-cover border border-white'
                />
                <div className='text-white font-medium flex items-center gap-1.5'>
                    <span>{viewStory.user?.full_name}</span>
                    <BadgeCheck size={18} />
                </div>
            </div>

            {/* Close Button - Pushed away from the top-right corner with extra padding */}
            <button 
                onClick={handleClose} 
                className='absolute top-6 right-6 p-2 text-white text-3xl font-bold focus:outline-none z-10'
            >
                <X className='w-8 h-8 hover:scale-110 transition cursor-pointer' />
            </button>

            {/* Content Wrapper */}
            <div className='w-full max-w-[90vw] max-h-[90vh] flex items-center justify-center'>
                {renderContent()}
            </div>

        </div>
    );
};

export default StoryViewer;