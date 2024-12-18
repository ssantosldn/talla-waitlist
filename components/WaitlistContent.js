"use client";

import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { 
  ArrowRight, 
  CheckCircle, 
  Instagram, 
  Twitter, 
  LinkedinIcon,
  MessageCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Logo } from "@/components/Logo";
import Image from 'next/image';

// Initialize EmailJS
emailjs.init(process.env.EMAILJS_USER_ID);

function WaitlistContent() {
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
      setMounted(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }, []);

    const saveToGoogleSheets = async (email) => {
      try {
        const response = await fetch('/api/submit-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email,
            timestamp: new Date().toISOString(),
          }),
        });

        const data = await response.json();
        console.log('Server response:', data); // Debug log

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Failed to save to Google Sheets');
        }

        return data;
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          cause: error.cause,
          stack: error.stack
        });
        throw error;
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!email) return;
      
      setIsLoading(true);
      
      try {
        // First, save to Google Sheets
        const sheetsResponse = await saveToGoogleSheets(email);
        console.log('Google Sheets Response:', sheetsResponse);

        // Then send email using EmailJS
        const result = await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
          { 
            to_email: email,
            reply_to: email,
            to_name: email.split('@')[0],
            message: "Thank you for joining our waitlist! We&apos;ll keep you updated on our launch."
          },
          process.env.NEXT_PUBLIC_EMAILJS_USER_ID
        );

        if (result.text === 'OK') {
          setIsSubmitted(true);
        }
      } catch (error) {
        console.error('Error:', error);
        let errorMessage = 'There was an error processing your request. Please try again.';
        
        // Handle specific error messages from the API
        if (error.message.includes('Permission denied')) {
          errorMessage = 'Our system is temporarily unable to process your request. The team has been notified.';
          console.error('Permission error - please check Google Sheet permissions');
        } else if (error.status === 400) {
          errorMessage = 'Invalid email address. Please check and try again.';
        } else if (error.status === 429) {
          errorMessage = 'Too many requests. Please try again in a few minutes.';
        }
        
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    const COLORS = {
      background: '#F6F6F6',
      card: '#FFFFFF',
      text: '#0C0C0C',
      accent: '#BCEF36',
      main: '#022213'
    };
    
    const socialLinks = [
      {
        Icon: Instagram,
        url: 'https://instagram.com/your_handle',
        label: 'Instagram'
      },
      {
        Icon: Twitter,
        url: 'https://twitter.com/your_handle',
        label: 'Twitter'
      },
      {
        Icon: LinkedinIcon,
        url: 'https://linkedin.com/company/your_company',
        label: 'LinkedIn'
      },
      {
        Icon: Twitter, // Using Twitter temporarily for testing
        url: 'https://discord.gg/your_invite',
        label: 'Discord',
        badge: 'Join the Discord'
      }
    ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: COLORS.background }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
        {/* Desktop Logo */}
        <div style={{ position: 'absolute', left: '32px', top: '32px' }} className="hidden md:block">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <span style={{ color: COLORS.main }} className="text-2xl font-bold">
              TALLA
            </span>
          </div>
        </div>

        {/* Mobile Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-8 md:hidden">
          <div className="flex items-center gap-3">
            <Logo size={24} />
            <span style={{ color: COLORS.main }} className="text-2xl font-bold">
              TALLA
            </span>
          </div>
        </div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <DotPattern
            className="opacity-50 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
            width={32}
            height={32}
            cx={16}
            cy={16}
            cr={1.5}
          />
        </div>

        {/* Main Content */}
        <div className="w-full max-w-2xl px-4 z-10 mt-24 md:mt-0">
          <div 
            className="relative rounded-3xl p-8 shadow-lg backdrop-blur-sm"
            style={{ 
              backgroundColor: COLORS.card,
              opacity: 0,
              transform: 'translateY(20px)',
              animation: isVisible ? 'fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards' : 'none'
            }}
          >
            {!isSubmitted ? (
              <div className="space-y-6">
                <div 
                  style={{
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: isVisible ? 'fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards' : 'none'
                  }}
                  className="flex justify-center"
                >
                  <div
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: COLORS.accent,
                      color: COLORS.main
                    }}
                  >
                    Grow your social media
                  </div>
                </div>
                
                <div 
                  style={{
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: isVisible ? 'fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards' : 'none'
                  }}
                  className="text-center space-y-2"
                >
                  <h1 
                    className="text-3xl md:text-4xl font-bold"
                    style={{ color: COLORS.main }}
                  >
                    Join the Future
                  </h1>
                  
                  <p style={{ color: `${COLORS.text}CC` }} className="text-lg">
                    Get early access to the next generation of social growth tools
                  </p>
                </div>

                <div
                  style={{
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: isVisible ? 'fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards' : 'none'
                  }}
                >
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                    <input
  type="email"
  required
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
  className="w-full h-11 px-4 text-base outline-none transition-all duration-300"
  style={{ 
    backgroundColor: COLORS.background,
    color: COLORS.text,
    border: `2px solid ${COLORS.main}15`,
    borderRadius: '6px'
  }}
/>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 whitespace-nowrap px-5 h-11 text-base font-medium transition-all duration-300 hover:scale-[1.02]"
                      style={{ 
                        backgroundColor: COLORS.main,
                        color: COLORS.card,
                        borderRadius: '6px'
                      }}
                    >
                      {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div 
                  style={{
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: isVisible ? 'fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) 1.5s forwards' : 'none'
                  }}
                  className="flex items-center gap-2 justify-center"
                >
                  <div className="animate-pulse-ring relative">
                    <div 
                      className="w-2 h-2 rounded-full relative z-10"
                      style={{ backgroundColor: COLORS.main }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ 
                        backgroundColor: COLORS.accent,
                        opacity: 0.8
                      }}
                    />
                  </div>
                  <span style={{ color: `${COLORS.text}99` }} className="text-sm">
                    Limited spots available
                  </span>
                </div>

                <div 
  style={{
    opacity: 0,
    transform: 'translateY(20px)',
    animation: isVisible ? 'fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) 1.8s forwards' : 'none',
    borderColor: `${COLORS.main}15`
  }}
  className="pt-6 space-y-4 border-t"
>
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center -space-x-2">
                    {[1, 2, 3, 4, 5].map((index) => (
  <div
    key={index}
    className="w-8 h-8 rounded-full border-2 overflow-hidden"
    style={{ 
      borderColor: COLORS.card,
      backgroundColor: `${COLORS.main}10`
    }}
  >
    <Image
      src={`https://i.pravatar.cc/32?img=${index}`}
      alt={`User ${index}`}
      width={32}
      height={32}
      className="w-full h-full object-cover"
    />
  </div>
))}
                      <div 
                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium"
                        style={{ 
                          borderColor: COLORS.card,
                          backgroundColor: `${COLORS.accent}99`,
                          color: COLORS.main
                        }}
                      >
                        +2k
                      </div>
                    </div>
                    <p style={{ color: `${COLORS.text}99` }} className="text-sm text-center">
                      Join 2,000+ professionals already on the waitlist
                    </p>
                    <div className="flex justify-center gap-6">
  {socialLinks.map(({ Icon, url, label, badge }, index) => {
    if (badge) {
      return (
        <a 
          key={index} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label={label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105"
          style={{ 
            backgroundColor: COLORS.accent,
            color: COLORS.main
          }}
        >
          <MessageCircle size={16} />
          <span className="text-xs font-medium whitespace-nowrap">
            {badge}
          </span>
        </a>
      );
    }
    return (
      <a 
        key={index} 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label={label}
      >
        <Icon 
          size={20} 
          style={{ color: `${COLORS.main}77` }}
          className="transition-all duration-300 hover:scale-110"
        />
      </a>
    );
  })}
</div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="space-y-6 text-center"
                style={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  animation: 'fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ backgroundColor: `${COLORS.accent}15` }}
                >
                  <CheckCircle style={{ color: COLORS.accent }} size={32} />
                </div>
                
                <div className="space-y-2">
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: COLORS.main }}
                  >
                    Welcome Aboard!
                  </h2>
                  
                  <p style={{ color: `${COLORS.text}CC` }}>
                  You&apos;re in! We&apos;ll notify you when we launch.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.9;
          }
        }

        .animate-pulse-ring::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background-color: ${COLORS.accent};
          opacity: 0.7;
          animation: pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes dots-fade {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 0.4;
          }
        }

        .fill-neutral-300\/40 {
          fill: rgba(210, 210, 210, 0.4);
          animation: dots-fade 1s ease-out forwards;
        }

        [mask-image\:radial-gradient\(circle_at_center\,white\,transparent\)] {
          mask-image: radial-gradient(circle at center, white, transparent);
        }
      `}</style>
    </div>
  );
}

export default WaitlistContent;