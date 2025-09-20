

import React from 'react';
import type { Tour, WebsiteSection } from '../types';
import { XIcon, VideoIcon, ImageIcon, QuoteIcon, TwitterIcon, InstagramIcon, FacebookIcon, YoutubeIcon } from './IconComponents';

const socialIconMap = {
    twitter: <TwitterIcon className="w-6 h-6" />,
    instagram: <InstagramIcon className="w-6 h-6" />,
    facebook: <FacebookIcon className="w-6 h-6" />,
    youtube: <YoutubeIcon className="w-6 h-6" />,
};

// --- Reusable Section Components ---

export const Header: React.FC<{
    header: WebsiteSection;
    navSections: WebsiteSection[];
    tourName: string;
    onClose?: () => void;
    activeSectionId?: string | null;
}> = ({ header, navSections, tourName, onClose, activeSectionId }) => {
    const navLinks = navSections
      .filter(section => section.type !== 'header' && section.type !== 'footer')
      .map(section => {
        const title = section.content.title || (section.type.charAt(0).toUpperCase() + section.type.slice(1));
        return {
            id: section.id,
            href: `#${section.id}`,
            title: title,
        };
    });

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <header className="sticky top-0 bg-white/80 backdrop-blur-lg shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
                <div className="flex items-center">
                    <span className="text-xl font-bold text-slate-800">ShowRunner</span>
                </div>
                <nav className="hidden md:flex items-center space-x-8">
                    {navLinks.map(link => (
                        <a 
                            key={link.id} 
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className={`font-semibold transition-colors ${
                                activeSectionId === link.id
                                ? 'text-blue-600'
                                : 'text-slate-600 hover:text-blue-600'
                            }`}
                        >
                            {link.title}
                        </a>
                    ))}
                </nav>
                {onClose && (
                    <button onClick={onClose} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-semibold flex items-center gap-2">
                        <XIcon className="w-4 h-4" /> Close Preview
                    </button>
                )}
            </div>
        </header>
    );
};

export const HeroSection: React.FC<{ section: WebsiteSection, tour: Tour }> = ({ section, tour }) => (
    <section id={section.id} className="h-[70vh] bg-cover bg-center relative flex items-center justify-center text-center" style={{ backgroundImage: `url(${section.content.imageUrl || tour.imageUrl})` }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative text-white p-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight drop-shadow-2xl">{section.content.headline || tour.tourName}</h1>
            <p className="text-xl md:text-2xl mt-4 max-w-3xl mx-auto drop-shadow-lg">{section.content.subheadline || `Join ${tour.artistName} live!`}</p>
        </div>
    </section>
);

export const AboutSection: React.FC<{ section: WebsiteSection }> = ({ section }) => (
    <section id={section.id} className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900 mb-8">{section.content.title || 'About The Tour'}</h2>
            <div className="prose prose-xl text-slate-700 mx-auto whitespace-pre-wrap leading-relaxed">{section.content.body || 'More details coming soon.'}</div>
        </div>
    </section>
);

export const VideoSection: React.FC<{ section: WebsiteSection }> = ({ section }) => {
    const getEmbedUrl = (url: string | undefined): string | null => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('youtube.com')) {
                const videoId = urlObj.searchParams.get('v');
                return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            }
            if (urlObj.hostname.includes('vimeo.com')) {
                const videoId = urlObj.pathname.split('/').pop();
                return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
            }
        } catch (error) { return null; }
        return null;
    };
    const embedUrl = getEmbedUrl(section.content.videoUrl);
    return (
        <section id={section.id} className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900 mb-8">{section.content.title || 'Official Video'}</h2>
                {embedUrl ? (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                        <iframe src={embedUrl} width="100%" height="100%" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Embedded Video"></iframe>
                    </div>
                ) : (
                    <div className="aspect-video bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                        <VideoIcon className="w-16 h-16"/>
                    </div>
                )}
            </div>
        </section>
    );
};

export const TicketsSection: React.FC<{ section: WebsiteSection }> = ({ section }) => (
    <section id={section.id} className="py-24 px-6 text-white text-center bg-blue-600">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold">{section.content.title || 'Tickets On Sale Now!'}</h2>
            <a href={section.content.ticketUrl || '#'} target="_blank" rel="noopener noreferrer" className="inline-block mt-8 px-12 py-4 bg-white text-blue-600 font-bold text-lg rounded-full transition-colors hover:bg-slate-100 shadow-xl">
                {section.content.buttonText || 'Buy Tickets'}
            </a>
        </div>
    </section>
);

export const GallerySection: React.FC<{ section: WebsiteSection }> = ({ section }) => {
    const images = section.content.images || [];
    return (
        <section id={section.id} className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900 mb-12">{section.content.title || 'Gallery'}</h2>
                {images.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <a href={image.url} key={index} target="_blank" rel="noopener noreferrer" className="group aspect-square block bg-slate-100 rounded-xl overflow-hidden relative shadow-lg ring-1 ring-black/5">
                                <img src={image.url} alt={image.caption || `Gallery image ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                {image.caption && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <p className="text-white text-sm font-semibold">{image.caption}</p>
                                    </div>
                                )}
                            </a>
                        ))}
                     </div>
                ) : (
                    <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500">
                        <ImageIcon className="w-16 h-16 mb-2"/>
                        <p>No images have been added yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export const TestimonialsSection: React.FC<{ section: WebsiteSection }> = ({ section }) => {
    const testimonials = section.content.testimonials || [];
    return (
        <section id={section.id} className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900 mb-16">{section.content.title || 'What Fans Are Saying'}</h2>
                {testimonials.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {testimonials.map((t, index) => (
                           <div key={index} className="relative bg-white pt-16 p-8 rounded-xl shadow-xl text-center ring-1 ring-black/5">
                               {t.imageUrl && <img src={t.imageUrl} alt={t.author} className="w-24 h-24 rounded-full mx-auto absolute -top-12 left-1/2 -translate-x-12 border-4 border-white object-cover" />}
                               <blockquote className="text-lg italic text-slate-700 relative">
                                    <QuoteIcon className="absolute -top-4 -left-4 w-12 h-12 text-slate-100 -z-10" />
                                    "{t.quote}"
                               </blockquote>
                               <footer className="mt-6 font-bold text-slate-800 text-lg">&mdash; {t.author}</footer>
                           </div>
                        ))}
                     </div>
                ) : (
                    <div className="bg-slate-100 rounded-xl p-12 text-center text-slate-500">
                         <QuoteIcon className="w-16 h-16 mx-auto mb-2"/>
                        <p>No testimonials yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export const CtaSection: React.FC<{ section: WebsiteSection }> = ({ section }) => (
     <section id={section.id} className="py-24 px-6 text-white text-center bg-slate-800">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold">{section.content.ctaTitle || 'Join The Community'}</h2>
            <p className="text-xl text-slate-300 mt-4 max-w-2xl mx-auto">{section.content.ctaBody || 'Sign up for our newsletter to get the latest updates.'}</p>
            <a href={section.content.ctaButtonUrl || '#'} target="_blank" rel="noopener noreferrer" className="inline-block mt-8 px-12 py-4 bg-blue-600 text-white font-bold text-lg rounded-full transition-all hover:scale-105 shadow-2xl hover:bg-blue-700">
                {section.content.ctaButtonText || 'Sign Up'}
            </a>
        </div>
    </section>
);

export const Footer: React.FC<{ footer: WebsiteSection }> = ({ footer }) => (
    <footer id={footer.id} className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto text-center">
            {footer.content.socialLinks && footer.content.socialLinks.length > 0 && (
                <div className="flex justify-center items-center space-x-6 mb-8">
                    {footer.content.socialLinks.map(link => (
                        <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                            {socialIconMap[link.platform]}
                        </a>
                    ))}
                </div>
            )}
            <p className="text-sm">{footer.content.copyrightText || `© ${new Date().getFullYear()} All rights reserved.`}</p>
            <p className="mt-2 text-xs">Powered by ShowRunner</p>
        </div>
    </footer>
);

interface PublicWebsiteViewProps {
    tour: Tour;
    onClose: () => void;
}

export const PublicWebsiteView: React.FC<PublicWebsiteViewProps> = ({ tour, onClose }) => {
    const [activeSectionId, setActiveSectionId] = React.useState<string | null>(null);

    const websiteSections = tour.website || [];
    const headerSection = websiteSections.find(s => s.type === 'header');
    const footerSection = websiteSections.find(s => s.type === 'footer');
    const mainSections = websiteSections.filter(s => s.type !== 'header' && s.type !== 'footer');
    
    React.useEffect(() => {
        const observerOptions: IntersectionObserverInit = {
            rootMargin: "-20% 0px -80% 0px", // Sets a horizontal "trigger zone" 20% from the top of the viewport
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSectionId(entry.target.id);
                }
            });
        };
        
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        const sections = mainSections.map(s => document.getElementById(s.id)).filter(Boolean);
        sections.forEach(section => observer.observe(section!));
        
        return () => {
            sections.forEach(section => observer.unobserve(section!));
        };
    }, [mainSections]);

    return (
        <div className="bg-white min-h-screen font-sans">
            {headerSection && <Header header={headerSection} navSections={mainSections} tourName={tour.tourName} onClose={onClose} activeSectionId={activeSectionId} />}
            
            <main>
                 {!headerSection && ( // Fallback close button if no header is present
                     <div className="fixed top-4 right-4 z-50">
                        <button onClick={onClose} className="px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/60 text-sm font-semibold flex items-center gap-2">
                            <XIcon className="w-5 h-5"/> Close Preview
                        </button>
                    </div>
                )}
                {mainSections.map((section, index) => {
                    const Wrapper = ({ children }: {children: React.ReactNode}) => (
                        <div className={index % 2 === 1 && !['tickets', 'cta'].includes(section.type) ? 'bg-slate-50' : 'bg-white'}>{children}</div>
                    );

                    let content = null;
                    switch(section.type) {
                        case 'hero': content = <HeroSection key={section.id} section={section} tour={tour} />; break;
                        case 'about': content = <AboutSection key={section.id} section={section} />; break;
                        case 'video': content = <VideoSection key={section.id} section={section} />; break;
                        case 'tickets': content = <TicketsSection key={section.id} section={section} />; break;
                        case 'gallery': content = <GallerySection key={section.id} section={section} />; break;
                        case 'testimonials': content = <TestimonialsSection key={section.id} section={section} />; break;
                        case 'cta': content = <CtaSection key={section.id} section={section} />; break;
                    }

                    if (section.type === 'hero') return content;
                    return <Wrapper key={section.id}>{content}</Wrapper>;
                })}
            </main>
            
            {footerSection && <Footer footer={footerSection} />}
        </div>
    );
};