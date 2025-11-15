import React, { useState, useEffect, useRef } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: { name: string; email: string; agency: string; message: string; }) => void;
}

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"></path>
        <path d="M17 11a1 1 0 012 0v1a6 6 0 01-5.026 5.95L14 18v2h-4v-2l.026-.05A6 6 0 015 12v-1a1 1 0 112 0v1a4 4 0 008 0v-1z"></path>
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


const formatEmailFromSpeech = (transcript: string): string => {
  // Process the transcript in a pipeline for clarity and robustness.
  return transcript
    .toLowerCase()
    // 1. Replace spoken symbols with their character equivalents.
    // Using word boundaries (\b) ensures we don't replace parts of words (e.g., 'at' in 'attention').
    .replace(/\b(at sign|at symbol|at the rate of|at)\b/g, '@')
    .replace(/\bdot\b/g, '.')
    .replace(/\bunderscore\b/g, '_')
    .replace(/\b(dash|hyphen)\b/g, '-')
    // 2. Remove all whitespace characters.
    .replace(/\s+/g, '');
};

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState('');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const formattedEmail = formatEmailFromSpeech(transcript);
      setEmail(formattedEmail);
      setError('');
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied. Please enable it in your browser settings.");
      } else {
        setError("Speech input failed. Please try again.");
      }
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
        setError("Voice input is not supported on your browser.");
        return;
    }
    if (isRecording) {
        recognitionRef.current.stop();
    } else {
        setError('');
        try {
            recognitionRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Could not start speech recognition:", err);
            setError("Could not start voice input. Please try again.");
            setIsRecording(false);
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && agency && message) {
      setStatus('sending');
      // Simulate network request
      setTimeout(() => {
        onSubmit({ name, email, agency, message });
        setStatus('success');
        setTimeout(() => {
            handleClose();
        }, 2500);
      }, 1000);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form state after transition
    setTimeout(() => {
      setName('');
      setEmail('');
      setAgency('');
      setMessage('');
      setStatus('idle');
      setError('');
    }, 300);
  };

  if (!isOpen) return null;

  const inputClass = "w-full mt-2 px-4 py-3 text-brand-light bg-brand-bg/80 border border-brand-light/20 rounded-md shadow-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all disabled:opacity-50";

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/70 backdrop-blur-lg border border-cyan-400/10 rounded-xl shadow-2xl p-8 max-w-md w-full relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors z-10" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
            <div className="text-center py-8 flex flex-col items-center justify-center">
                <CheckIcon />
                <h2 className="font-heading text-2xl font-bold text-white mt-4">Thank You!</h2>
                <p className="text-gray-300 mt-2">Your message has been sent. We'll get back to you shortly.</p>
            </div>
        ) : (
            <>
                <h2 className="font-heading text-2xl font-bold text-white">Contact Us</h2>
                <p className="text-gray-300 mt-2">Have a question or want to get in touch? Drop us a line.</p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label htmlFor="contact-name" className="text-sm font-medium text-white">Full Name</label>
                    <input id="contact-name" type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClass} placeholder="Your Name" disabled={status === 'sending'} />
                </div>

                <div>
                    <label htmlFor="contact-email" className="text-sm font-medium text-white">Email Address</label>
                    <div className="relative">
                        <input id="contact-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className={`${inputClass} pr-12`} placeholder="your.email@company.com" disabled={status === 'sending'} />
                        <button type="button" onClick={handleMicClick} className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-cyan text-white hover:bg-brand-magenta'}`} aria-label={isRecording ? 'Stop recording' : 'Start recording'}>
                            <MicrophoneIcon className="h-5 w-5" />
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                    {isRecording && <p className="text-cyan-400 text-sm mt-1 animate-pulse">Listening...</p>}
                </div>

                <div>
                    <label htmlFor="contact-agency" className="text-sm font-medium text-white">Company / Agency</label>
                    <input id="contact-agency" type="text" value={agency} onChange={e => setAgency(e.target.value)} required className={inputClass} placeholder="Your Agency Name" disabled={status === 'sending'}/>
                </div>

                <div>
                    <label htmlFor="contact-message" className="text-sm font-medium text-white">Message</label>
                    <textarea id="contact-message" value={message} onChange={e => setMessage(e.target.value)} required rows={4} className={inputClass} placeholder="How can we help you?" disabled={status === 'sending'} />
                </div>
                
                <button type="submit" disabled={status === 'sending'} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50">
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                </form>
            </>
        )}
      </div>
    </div>
  );
};

export default ContactModal;