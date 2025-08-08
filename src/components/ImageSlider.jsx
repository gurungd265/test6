import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ImageSlider({ images = [], productName }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [clickedImageIndex, setClickedImageIndex] = useState(0);

    // images massiv ekanligiga ishonch hosil qilamiz
    const safeImages = Array.isArray(images) ? images : [];

    // Agar rasm bo'lmasa, placeholder qo'shamiz
    const displayImages = safeImages.length > 0 ? safeImages : [{
        imageUrl: 'https://via.placeholder.com/600x600?text=No+Image',
        altText: 'No image available'
    }];

    // Ekran o'lchamini kuzatish
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Keyingi rasmga o'tish
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    // Oldingi rasmga o'tish
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
        );
    };

    // Modalni ochish
    const openModal = (index) => {
        setClickedImageIndex(index); // Bosilgan rasm indeksini saqlaymiz
        setModalOpen(true);
    };

    // Ko'rsatiladigan rasmlarni aniqlash
    const getCurrentImages = () => {
        if (isMobile || displayImages.length <= 1) {
            return [{...displayImages[currentIndex], originalIndex: currentIndex}];
        }
        
        if (currentIndex === displayImages.length - 1) {
            return [
                {...displayImages[currentIndex], originalIndex: currentIndex},
                {...displayImages[0], originalIndex: 0}
            ];
        }
        
        return [
            {...displayImages[currentIndex], originalIndex: currentIndex},
            {...displayImages[currentIndex + 1], originalIndex: currentIndex + 1}
        ];
    };

    const currentImages = getCurrentImages();

    return (
        <div className="relative">
            {/* Slider Controls */}
            {displayImages.length > 1 && (
                <>
                    <button 
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-110 z-10 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    
                    <button 
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-110 z-10 transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Image Slides */}
            <div className={`grid ${isMobile || displayImages.length <= 1 ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
                {currentImages.map((img, i) => (
                    <div key={i} className="relative group">
                        <img 
                            src={img.imageUrl} 
                            alt={img.altText || `${productName} ${i + 1}`}
                            onClick={() => openModal(img.originalIndex)} // originalIndex ni yuboramiz
                            className="w-full h-[420px] object-cover rounded-lg shadow cursor-zoom-in hover:opacity-90 transition-opacity" 
                        />
                    </div>
                ))}
            </div>

            {/* Indicators */}
            {displayImages.length > 1 && (
                <div className="flex justify-center mt-2 space-x-2">
                    {displayImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <button 
                        onClick={() => setModalOpen(false)}
                        className="absolute top-4 right-4 bg-white rounded-full p-2 hover:scale-110 transition-transform"
                    >
                        <X size={24} />
                    </button>
                    
                    {displayImages.length > 1 && (
                        <>
                            <button 
                                onClick={() => {
                                    setClickedImageIndex(prev => 
                                        prev === 0 ? displayImages.length - 1 : prev - 1
                                    );
                                }}
                                className="absolute left-4 bg-white/80 p-2 rounded-full hover:scale-110 transition-transform"
                            >
                                <ChevronLeft size={30} />
                            </button>
                            
                            <button 
                                onClick={() => {
                                    setClickedImageIndex(prev => 
                                        prev === displayImages.length - 1 ? 0 : prev + 1
                                    );
                                }}
                                className="absolute right-4 bg-white/80 p-2 rounded-full hover:scale-110 transition-transform"
                            >
                                <ChevronRight size={30} />
                            </button>
                        </>
                    )}
                    
                    <img
                        src={displayImages[clickedImageIndex]?.imageUrl}
                        alt={displayImages[clickedImageIndex]?.altText || `${productName} (zoomed)`}
                        className="max-w-full max-h-full object-contain rounded"
                    />
                    
                    {displayImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {clickedImageIndex + 1} / {displayImages.length}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}