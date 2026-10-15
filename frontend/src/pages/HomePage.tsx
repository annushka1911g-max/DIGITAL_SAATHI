import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  ShieldAlert,
  FileText,
  FileQuestion,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { SpeechSpeaker } from '../components/SpeechSpeaker';

export const HomePage: React.FC = () => {
  const { language } = useAccessibility();

  const isHi = language === 'hi';

  const heroIntroText = isHi
    ? 'डिजिटल साथी में आपका स्वागत है। यहां आप बोलकर कोई भी सरकारी योजना, बिल या बैंक फॉर्म समझ सकते हैं और फर्जी मैसेज से सुरक्षित रह सकते हैं।'
    : 'Welcome to Digital Saathi. Use your voice to understand government schemes, bills, and forms, and stay protected from online frauds.';

  const featureCards = [
    {
      title: isHi ? 'वॉइस साथी' : 'Voice Assistant',
      hindiSub: 'बोलकर बात करें',
      desc: isHi
        ? 'हिंदी या अपनी भाषा में बोलकर सवाल पूछें। डिजिटल साथी सरल शब्दों में समझाएगा और बोलकर सुनाएगा।'
        : 'Ask any question using your voice. Digital Saathi explains in plain language and speaks back aloud.',
      icon: Mic,
      to: '/assistant',
      color: 'from-blue-600 to-indigo-700',
      badge: isHi ? 'आवाज़ से मदद' : 'Voice-First',
      popularPrompt: isHi
        ? '“राशन कार्ड में नया नाम कैसे जुड़वाएं?”'
        : '“How do I update my address in Aadhaar?”',
    },
    {
      title: isHi ? 'स्कैम व फ्रॉड साथी' : 'Scam Saathi',
      hindiSub: 'संदेश व लिंक की जांच',
      desc: isHi
        ? 'संदिग्ध SMS, WhatsApp मैसेज या लिंक यहां डालें। तुरंत जानें कि यह असली है या कोई ठगी।'
        : 'Analyze suspicious SMS, WhatsApp forwards, or lottery messages. Get immediate safety verdicts and red-flag alerts.',
      icon: ShieldAlert,
      to: '/scams',
      color: 'from-rose-600 to-red-700',
      badge: isHi ? 'सुरक्षा कवच' : 'Safety Check',
      popularPrompt: isHi
        ? '“बिजली कटने का मैसेज आया है, क्या यह सच है?”'
        : '“Got a message saying electricity will be disconnected tonight.”',
    },
    {
      title: isHi ? 'दस्तावेज़ साथी' : 'Document Saathi',
      hindiSub: 'दस्तावेज़ आसान भाषा में समझें',
      desc: isHi
        ? 'बिजली बिल, पेंशन पत्र या बैंक नोटिस की फोटो या PDF अपलोड करें। अंतिम तिथि और राशि तुरंत जानें।'
        : 'Upload any electricity bill, pension letter, or bank notice. Get simple summaries and key dates instantly.',
      icon: FileText,
      to: '/documents',
      color: 'from-emerald-600 to-teal-700',
      badge: isHi ? 'सरल सारांश' : 'PDF & Bills',
      popularPrompt: isHi
        ? '“इस नोटिस में मुझे कब तक पैसे जमा करने हैं?”'
        : '“What is the last date mentioned in this bill?”',
    },
    {
      title: isHi ? 'फॉर्म साथी' : 'Form Saathi',
      hindiSub: 'सरकारी व बैंक फॉर्म गाइड',
      desc: isHi
        ? 'कठिन सरकारी शब्दों (जैसे IFSC, Aadhaar Seeding, Nominee) का मतलब समझें और फॉर्म सही भरें।'
        : 'Step-by-step guidance for complex official and welfare forms with plain-language explanations.',
      icon: FileQuestion,
      to: '/forms',
      color: 'from-amber-500 to-orange-600',
      badge: isHi ? 'कदम-दर-कदम' : 'Step-by-Step',
      popularPrompt: isHi
        ? '“पीएम-किसान फॉर्म में आधार सीडिंग क्या होता है?”'
        : '“What documents are needed for old-age pension?”',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F2C59] via-[#143B75] to-[#1E4E8C] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs sm:text-sm font-semibold">
            <Sparkles size={16} />
            <span>
              {isHi
                ? 'भारत का अपना सुगम व सुरक्षित डिजिटल सहायक'
                : 'India’s Accessible & Voice-First Digital Assistant'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {isHi ? (
              <>
                आपकी भाषा, आपकी आवाज़, <br />
                <span className="text-amber-400">आपका डिजिटल साथी</span>
              </>
            ) : (
              <>
                Your Voice, Your Language, <br />
                <span className="text-amber-400">Your Digital Saathi</span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            {heroIntroText}
          </p>

          {/* Read Aloud button for hero */}
          <div className="flex justify-center items-center gap-3">
            <SpeechSpeaker
              text={heroIntroText}
              label={isHi ? 'यह जानकारी सुनें (Audio)' : 'Listen Aloud'}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm py-2 px-4 rounded-full"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/assistant"
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Mic size={20} />
              <span>{isHi ? 'बोलकर पूछना शुरू करें' : 'Start with Voice'}</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/scams"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl text-base border border-white/20 transition-all backdrop-blur-xs"
            >
              <ShieldAlert size={20} className="text-red-400" />
              <span>{isHi ? 'संदेश की जांच करें' : 'Verify Scam Message'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main 4 Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {isHi ? 'डिजिटल साथी कैसे आपकी मदद करता है?' : 'Core Assistance Modules'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            {isHi
              ? 'बिना किसी परेशानी के, सीधे अपनी आवाज़ या सरल शब्दों में सहायता प्राप्त करें।'
              : 'Empowering digital independence with effortless voice interactions.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={28} />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {card.title}
                    <span className="text-sm font-normal text-slate-500">
                      ({card.hindiSub})
                    </span>
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {card.desc}
                  </p>

                  {/* Sample prompt chip */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {isHi ? 'उदाहरण:' : 'Example:'}
                    </span>
                    <span className="italic">{card.popularPrompt}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                  <SpeechSpeaker text={`${card.title}. ${card.desc}`} size="sm" />
                  <Link
                    to={card.to}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0F2C59] dark:text-blue-400 group-hover:underline"
                  >
                    <span>{isHi ? 'शुरू करें' : 'Open Module'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cyber Helpline Emergency Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <AlertTriangle size={14} />
              <span>{isHi ? 'राष्ट्रीय आपातकालीन सुरक्षा' : 'National Cyber Alert'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              {isHi
                ? 'क्या आपके बैंक खाते से अनजाने में पैसे कटे हैं?'
                : 'Suspect a Fraudulent Bank Deduction or Lottery Scam?'}
            </h3>
            <p className="text-sm text-red-100 max-w-2xl">
              {isHi
                ? 'घबराएं नहीं! भारतीय गृह मंत्रालय के साइबर सेल हेल्पलाइन 1930 पर तुरंत कॉल करें ताकि पैसे को ठगों के खाते में फ्रीज कराया जा सके।'
                : 'Do not panic. Call National Cybercrime Helpline 1930 immediately to freeze fraudulent money transfers.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href="tel:1930"
              className="flex items-center justify-center gap-2 bg-white text-red-700 font-extrabold px-6 py-3.5 rounded-xl text-base shadow hover:bg-red-50 transition-colors"
            >
              <PhoneCall size={20} />
              <span>{isHi ? 'तुरंत 1930 मिलाएं' : 'Dial 1930 Now'}</span>
            </a>
            <Link
              to="/scams"
              className="flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white font-bold px-5 py-3.5 rounded-xl text-base border border-red-400/40 transition-colors"
            >
              <span>{isHi ? 'मैसेज जांचें' : 'Check Message'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Accessibility Guarantee & Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {isHi ? 'विशेष रूप से सभी नागरिकों के लिए सुगम' : 'Built for Everyone’s Accessibility'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isHi
                ? 'कम रोशनी में पढ़ने, बड़े अक्षरों, या सिर्फ सुनकर समझने की पूर्ण सुविधा।'
                : 'Compliant with WCAG 2.2 standards for screen readers, high contrast, and voice synthesis.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CheckCircle className="mx-auto text-emerald-600 dark:text-emerald-400 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {isHi ? 'आवाज़ से पूर्ण नियंत्रण' : 'Voice-First Navigation'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isHi ? 'टाइपिंग की आवश्यकता नहीं, केवल बोलकर काम करें' : 'No typing required, just speak naturally'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CheckCircle className="mx-auto text-emerald-600 dark:text-emerald-400 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {isHi ? 'बड़े अक्षर व उच्च कंट्रास्ट' : 'High Contrast & Text Scaling'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isHi ? 'बुजुर्गों और कमजोर दृष्टि के लिए स्पष्ट दृश्य' : 'Clear viewing for elderly and low-vision users'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CheckCircle className="mx-auto text-emerald-600 dark:text-emerald-400 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {isHi ? '100% सुरक्षित और निजी' : '100% Safe & Private'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isHi ? 'कोई निजी डेटा किसी तीसरे पक्ष को नहीं दिया जाता' : 'No personal data leaked to third parties'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
