import type { Route } from "./+types/home";
import { useState } from 'react';
import { Send, Copy, Check, Mail, Sparkles, MessageSquare, User } from 'lucide-react';
import { useFetcher } from 'react-router';
import { getMessageService } from '~/lib/message-service.server';
import type { MessageGenerationOptions } from '~/lib/types/claude';

export function loader() {
  return { name: "React Router" };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  
  const messageOptions: MessageGenerationOptions = {
    rawThoughts: formData.get('rawThoughts') as string,
    tone: formData.get('tone') as string,
    platform: formData.get('platform') as string,
    contextEmail: formData.get('contextEmail') as string || undefined,
    locale: formData.get('locale') as string || 'en-US',
  };
  
  try {
    const messageService = getMessageService();
    const result = await messageService.generateMessage(messageOptions);
    
    return {
      success: result.success,
      message: result.message,
      error: result.error,
      metadata: result.metadata,
    };
  } catch (error) {
    return {
      success: false,
      message: '',
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export default function Home(props: Route.ComponentProps) {
  return <EmailWriterApp {...props} />;
}

const TRANSLATIONS = {
  "en-US": {
    "emailWritingAssistant": "Email Writing Assistant",
    "transformThoughtsDescription": "Transform your thoughts into polished, professional emails with AI assistance",
    "yourThoughts": "Your Thoughts",
    "thoughtsPlaceholder": "Write what you want to communicate... Don't worry about grammar or structure - just get your ideas down.",
    "tipKeyboardShortcut": "💡 Tip: Press Cmd/Ctrl + Enter to generate your email",
    "emailTone": "Email Tone",
    "professionalTone": "Professional",
    "professionalDescription": "Clear and business-appropriate",
    "warmTone": "Warm",
    "warmDescription": "Friendly and approachable",
    "conciseTone": "Concise",
    "conciseDescription": "Brief and to the point",
    "formalTone": "Formal",
    "formalDescription": "Traditional and respectful",
    "casualTone": "Casual",
    "casualDescription": "Relaxed and conversational",
    "persuasiveTone": "Persuasive",
    "persuasiveDescription": "Compelling and convincing",
    "contextOptional": "Context (Optional)",
    "hide": "Hide",
    "show": "Show",
    "contextDescription": "Paste the email you're responding to for better context",
    "contextPlaceholder": "Paste the original email here...",
    "craftingEmail": "Crafting your email...",
    "generateEmail": "Generate Email",
    "generatedEmail": "Generated Email",
    "copied": "Copied!",
    "copy": "Copy",
    "emailWillAppearHere": "Your polished email will appear here",
    "getStartedPrompt": "Enter your thoughts and select a tone to get started",
    "proTips": "✨ Pro Tips",
    "tipBeSpecific": "• Be specific about what you want to achieve",
    "tipIncludeDetails": "• Include key details even if roughly written",
    "tipTryTones": "• Try different tones to see what works best",
    "tipAddContext": "• Add context for more personalized responses"
  },
  /* LOCALE_PLACEHOLDER_START */
  "es-ES": {
    "emailWritingAssistant": "Asistente de Redacción de Correos",
    "transformThoughtsDescription": "Transforma tus ideas en correos electrónicos pulidos y profesionales con asistencia de IA",
    "yourThoughts": "Tus Ideas",
    "thoughtsPlaceholder": "Escribe lo que quieres comunicar... No te preocupes por la gramática o estructura - solo plasma tus ideas.",
    "tipKeyboardShortcut": "💡 Consejo: Presiona Cmd/Ctrl + Enter para generar tu correo",
    "emailTone": "Tono del Correo",
    "professionalTone": "Profesional",
    "professionalDescription": "Claro y apropiado para negocios",
    "warmTone": "Cálido",
    "warmDescription": "Amigable y accesible",
    "conciseTone": "Conciso",
    "conciseDescription": "Breve y directo",
    "formalTone": "Formal",
    "formalDescription": "Tradicional y respetuoso",
    "casualTone": "Casual",
    "casualDescription": "Relajado y conversacional",
    "persuasiveTone": "Persuasivo",
    "persuasiveDescription": "Convincente y persuasivo",
    "contextOptional": "Contexto (Opcional)",
    "hide": "Ocultar",
    "show": "Mostrar",
    "contextDescription": "Pega el correo al que estás respondiendo para mejor contexto",
    "contextPlaceholder": "Pega el correo original aquí...",
    "craftingEmail": "Creando tu correo...",
    "generateEmail": "Generar Correo",
    "generatedEmail": "Correo Generado",
    "copied": "¡Copiado!",
    "copy": "Copiar",
    "emailWillAppearHere": "Tu correo pulido aparecerá aquí",
    "getStartedPrompt": "Ingresa tus ideas y selecciona un tono para comenzar",
    "proTips": "✨ Consejos Pro",
    "tipBeSpecific": "• Sé específico sobre lo que quieres lograr",
    "tipIncludeDetails": "• Incluye detalles clave aunque estén escritos de forma básica",
    "tipTryTones": "• Prueba diferentes tonos para ver cuál funciona mejor",
    "tipAddContext": "• Agrega contexto para respuestas más personalizadas"
  }
  /* LOCALE_PLACEHOLDER_END */
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale: string) => {
  if (TRANSLATIONS[locale as keyof typeof TRANSLATIONS]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key: string) => {
  const localeTranslations = TRANSLATIONS[locale as keyof typeof TRANSLATIONS];
  const fallbackTranslations = TRANSLATIONS['en-US'];
  return (localeTranslations as any)?.[key] || (fallbackTranslations as any)[key] || key;
};

export function EmailWriterApp({ loaderData }: Route.ComponentProps) {
  const [rawThoughts, setRawThoughts] = useState('');
  const [tone, setTone] = useState('professional');
  const [contextEmail, setContextEmail] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [platform, setPlatform] = useState('email');
  
  const fetcher = useFetcher<typeof action>();
  const isLoading = fetcher.state === 'submitting';
  
  // Update generated email when we get a response
  if (fetcher.data?.success && fetcher.data.message && fetcher.data.message !== generatedEmail) {
    setGeneratedEmail(fetcher.data.message);
  } else if (fetcher.data?.error && !fetcher.data.success) {
    setGeneratedEmail(`Sorry, there was an error generating your email: ${fetcher.data.error}`);
  }

  const tones = [
    { value: 'professional', label: t('professionalTone'), description: t('professionalDescription') },
    { value: 'warm', label: t('warmTone'), description: t('warmDescription') },
    { value: 'concise', label: t('conciseTone'), description: t('conciseDescription') },
    { value: 'formal', label: t('formalTone'), description: t('formalDescription') },
    { value: 'casual', label: t('casualTone'), description: t('casualDescription') },
    { value: 'persuasive', label: t('persuasiveTone'), description: t('persuasiveDescription') }
  ];

  const generateEmail = () => {
    if (!rawThoughts.trim()) return;

    const formData = new FormData();
    formData.append('rawThoughts', rawThoughts);
    formData.append('tone', tone);
    formData.append('platform', platform);
    formData.append('contextEmail', contextEmail);
    formData.append('locale', locale);
    
    fetcher.submit(formData, { method: 'POST' });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      generateEmail();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
              {t('emailWritingAssistant')}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('transformThoughtsDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800">{t('yourThoughts')}</h2>
              </div>
              
              <textarea
                value={rawThoughts}
                onChange={(e) => setRawThoughts(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('thoughtsPlaceholder')}
                className="w-full h-40 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-700 placeholder-slate-400"
              />
              
              <div className="mt-4 text-sm text-slate-500">
                {t('tipKeyboardShortcut')}
              </div>
            </div>

            {/* Tone Selection */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800">{t('emailTone')}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {tones.map((toneOption) => (
                  <button
                    key={toneOption.value}
                    onClick={() => setTone(toneOption.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      tone === toneOption.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white/70'
                    }`}
                  >
                    <div className="font-medium text-slate-800">{toneOption.label}</div>
                    <div className="text-sm text-slate-600 mt-1">{toneOption.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Context Email Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800">{t('contextOptional')}</h2>
                </div>
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {showContext ? t('hide') : t('show')}
                </button>
              </div>
              
              {showContext && (
                <>
                  <p className="text-slate-600 mb-4">
                    {t('contextDescription')}
                  </p>
                  <textarea
                    value={contextEmail}
                    onChange={(e) => setContextEmail(e.target.value)}
                    placeholder={t('contextPlaceholder')}
                    className="w-full h-32 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-700 placeholder-slate-400"
                  />
                </>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateEmail}
              disabled={isLoading || !rawThoughts.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('craftingEmail')}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t('generateEmail')}
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 min-h-96">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800">{t('generatedEmail')}</h2>
                </div>
                
                {generatedEmail && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700 font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        {t('copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('copy')}
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {generatedEmail ? (
                <div className="bg-white/80 rounded-xl p-6 border border-slate-200">
                  <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                    {generatedEmail}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Mail className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg">{t('emailWillAppearHere')}</p>
                  <p className="text-sm mt-2">{t('getStartedPrompt')}</p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-slate-800 mb-3">{t('proTips')}</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>{t('tipBeSpecific')}</li>
                <li>{t('tipIncludeDetails')}</li>
                <li>{t('tipTryTones')}</li>
                <li>{t('tipAddContext')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}