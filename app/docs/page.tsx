'use client';

import React, { useState } from 'react';
import { Book, Code, Box, Zap, Settings, Globe, Server, Terminal, Menu, X, ArrowRight } from 'lucide-react';

const DOC_SECTIONS = [
  {
    category: 'Getting Started',
    items: [
      { id: 'intro', icon: Book, title: 'Introduction' },
      { id: 'architecture', icon: Box, title: 'System Architecture' },
      { id: 'installation', icon: Terminal, title: 'Installation & Setup' },
    ]
  },
  {
    category: 'AI Pipeline Engine',
    items: [
      { id: 'pipeline', icon: Zap, title: 'Pipeline Stages' },
      { id: 'models', icon: Server, title: 'Model Routing (O1 & Gemini)' },
      { id: 'search', icon: Globe, title: 'Brave Search Integration' },
    ]
  },
  {
    category: 'API Reference',
    items: [
      { id: 'api-generate', icon: Code, title: 'POST /api/generate' },
      { id: 'api-deploy', icon: Globe, title: 'Cloudflare Deployment' },
    ]
  },
  {
    category: 'Advanced',
    items: [
      { id: 'rate-limits', icon: Settings, title: 'Rate Limiting & Security' },
      { id: 'extending', icon: Code, title: 'Extending Adapters' },
    ]
  }
];

const CONTENT = {
  en: {
    title: 'Docs',
    intro: {
      title: 'Welcome to Landing Pro Docs',
      subtitle: 'Landing Page Pro is an advanced, multi-agent AI orchestration platform designed to automatically analyze donor screenshots and output production-ready, dark-luxury HTML landing pages.',
      engine: 'Tri-Engine Approach',
      v1: 'Vision Analysis: Gemini 3.1 Flash converts pixels to a semantic design system.',
      v2: 'OSINT Research: Brave Search aggregates the latest niche psychological triggers.',
      v3: 'Generative Dev: Claude 3.5 / OpenRouter O1 strictly outputs validated semantic HTML.',
    },
    architecture: {
      title: 'System Architecture',
      subtitle: 'Built strictly for scale, reliability, and edge-compliance.',
      frontend: 'Frontend',
      frontendDesc: 'Next.js 16 App Router. TurboPack enabled. We strictly use `use client` with extracted state hooks (`useDashboardState`) to prevent React Server Component pollution.',
      ai: 'AI Adapters (lib/ai/)',
      aiDesc: 'Orchestrated under the Singleton `ModelRouter`. Abstracted to implement `BaseAdapter`, guaranteeing type safety. Adapters handle exponential backoff and timeout natively.',
    },
    pipeline: {
      title: 'The Pipeline Engine',
      subtitle: 'The core artifact lifecycle resides in `PipelineService.ts`.',
      s1Title: 'Vision',
      s1Desc: 'Analyses the image for colors and layout using Gemini Vision.',
      s2Title: 'Research',
      s2Desc: 'Brave Search pulls 5 top articles on niche performance.',
      s3Title: 'Copy & Code',
      s3Desc: 'Generates JSON persuasive copy, then strictly translates to an HTML artifact using Claude 3.5 / O1.',
    }
  },
  ru: {
    title: 'Доки',
    intro: {
      title: 'Добро пожаловать в Landing Pro Docs',
      subtitle: 'Landing Page Pro — это продвинутая платформа мультиагентной оркестрации ИИ, предназначенная для автоматического анализа скриншотов-доноров и создания готовых к работе лендингов.',
      engine: 'Трехдвижковый подход',
      v1: 'Vision-анализ: Gemini 3.1 Flash преобразует пиксели в семантическую дизайн-систему.',
      v2: 'OSINT-исследование: Brave Search собирает новейшие психологические триггеры ниши.',
      v3: 'Generative Dev: Claude 3.5 / OpenRouter O1 выдает валидированный семантический HTML-код.',
    },
    architecture: {
      title: 'Архитектура системы',
      subtitle: 'Построено строго для масштабируемости, надежности и соответствия edge-стандартам.',
      frontend: 'Фронтенд',
      frontendDesc: 'Next.js 16 App Router. TurboPack включен. Мы строго используем `use client` с хуками состояния (`useDashboardState`) для предотвращения загрязнения RSC.',
      ai: 'AI Адаптеры (lib/ai/)',
      aiDesc: 'Оркестрируются через Singleton `ModelRouter`. Абстрагированы через `BaseAdapter`, гарантируют типобезопасность. Адаптеры нативно обрабатывают повторы и таймауты.',
    },
    pipeline: {
      title: 'Движок Pipeline',
      subtitle: 'Основной жизненный цикл артефакта находится в `PipelineService.ts`.',
      s1Title: 'Vision (Зрение)',
      s1Desc: 'Анализирует изображение на предмет цветов и макета с помощью Gemini Vision.',
      s2Title: 'Research (Исследование)',
      s2Desc: 'Brave Search извлекает 5 топовых статей о показателях в нише.',
      s3Title: 'Copy & Code (Копирайт и Код)',
      s3Desc: 'Генерирует убедительный текст в формате JSON, затем транслирует его в HTML-артефакт.',
    }
  }
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('intro');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'ru'>('en');

  const t = CONTENT[lang];

  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return (
          <div className="prose prose-invert max-w-none text-[#EDEBE5]">
            <h1 className="text-4xl font-bold mb-4">{t.intro.title}</h1>
            <p className="text-lg text-[#A8A49B] mb-8">{t.intro.subtitle}</p>
            <div className="bg-[#161616] border border-[#C8A96E33] rounded-xl p-6 mb-8">
              <h3 className="font-bold text-[#C8A96E] text-xl mb-2 flex items-center gap-2"><Zap /> {t.intro.engine}</h3>
              <ul className="space-y-2 mt-4 text-[#A8A49B]">
                <li><strong>1.</strong> {t.intro.v1}</li>
                <li><strong>2.</strong> {t.intro.v2}</li>
                <li><strong>3.</strong> {t.intro.v3}</li>
              </ul>
            </div>
          </div>
        );
      case 'architecture':
        return (
          <div className="prose prose-invert max-w-none text-[#EDEBE5]">
            <h1 className="text-4xl font-bold mb-4">{t.architecture.title}</h1>
            <p className="text-lg text-[#A8A49B] mb-8">{t.architecture.subtitle}</p>
            <h3 className="text-xl font-bold mb-4 border-b border-[#333] pb-2">{t.architecture.frontend}</h3>
            <p className="mb-4">{t.architecture.frontendDesc}</p>
            <h3 className="text-xl font-bold mb-4 border-b border-[#333] pb-2">{t.architecture.ai}</h3>
            <p className="mb-4">{t.architecture.aiDesc}</p>
          </div>
        );
      case 'pipeline':
        return (
          <div className="prose prose-invert max-w-none text-[#EDEBE5]">
            <h1 className="text-4xl font-bold mb-4">{t.pipeline.title}</h1>
            <p className="text-lg text-[#A8A49B] mb-8">{t.pipeline.subtitle}</p>
            <div className="space-y-4">
              <div className="flex gap-4 items-start p-4 bg-[#0F0F0F] rounded-xl border border-[#333]">
                <div className="w-8 h-8 rounded-full bg-[#C8A96E1A] flex items-center justify-center shrink-0">1</div>
                <div><h4 className="font-bold text-[#C8A96E]">{t.pipeline.s1Title}</h4><p className="text-sm text-[#A8A49B]">{t.pipeline.s1Desc}</p></div>
              </div>
              <div className="flex gap-4 items-start p-4 bg-[#0F0F0F] rounded-xl border border-[#333]">
                <div className="w-8 h-8 rounded-full bg-[#C8A96E1A] flex items-center justify-center shrink-0">2</div>
                <div><h4 className="font-bold text-[#C8A96E]">{t.pipeline.s2Title}</h4><p className="text-sm text-[#A8A49B]">{t.pipeline.s2Desc}</p></div>
              </div>
              <div className="flex gap-4 items-start p-4 bg-[#0F0F0F] rounded-xl border border-[#333]">
                <div className="w-8 h-8 rounded-full bg-[#C8A96E1A] flex items-center justify-center shrink-0">3</div>
                <div><h4 className="font-bold text-[#C8A96E]">{t.pipeline.s3Title}</h4><p className="text-sm text-[#A8A49B]">{t.pipeline.s3Desc}</p></div>
              </div>
            </div>
          </div>
        );
      case 'api-deploy':
        return (
          <div className="prose prose-invert max-w-none text-[#EDEBE5]">
            <h1 className="text-4xl font-bold mb-4">Cloudflare Deployment API</h1>
            <p className="text-[#A8A49B] mb-6">Automated zero-downtime static deployments via Cloudflare Pages API v4.</p>
            <div className="bg-[#0F0F0F] p-4 rounded-xl border border-[#333] font-mono text-sm overflow-x-auto text-[#A8A49B] mb-6">
              POST /api/deploy
              <br/><br/>
              {`{`} <br/>
              &nbsp;&nbsp;projectId: "1234-abcd-..."<br/>
              {`}`}
            </div>
            <p>Triggers `cloudflareService.deployHtml()`. Converts HTML strings directly into Blobs on Node boundaries. Skips file-system IO overhead entirely.</p>
          </div>
        );
      default:
        return (
          <div className="prose prose-invert max-w-none text-[#EDEBE5]">
            <h1 className="text-4xl font-bold mb-4 capitalize">{activeSection.replace('-', ' ')}</h1>
            <p className="text-[#A8A49B]">Documentation content for this section is being updated.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#080808] text-[#EDEBE5] w-full font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 w-full h-16 bg-[#0F0F0F] border-b border-[#333] flex items-center justify-between px-4 z-50">
        <div className="font-bold tracking-widest text-[#C8A96E] flex items-center gap-2">
          <Book size={18} /> DOCS
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Docusaurus-style Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-[#0F0F0F] border-r border-[#C8A96E1A] z-40 
        transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col pt-16 lg:pt-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="hidden lg:flex h-16 items-center px-6 border-b border-[#333] justify-between">
          <div className="font-bold tracking-widest text-[#C8A96E] flex items-center gap-2">
            <Book size={18} /> L-PRO DOCS
          </div>
          <div className="flex bg-[#161616] rounded-lg p-1 border border-[#333]">
            <button 
              onClick={() => setLang('en')} 
              className={`px-2 py-0.5 text-[10px] rounded ${lang === 'en' ? 'bg-[#C8A96E] text-[#080808]' : 'text-[#555]'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('ru')} 
              className={`px-2 py-0.5 text-[10px] rounded ${lang === 'ru' ? 'bg-[#C8A96E] text-[#080808]' : 'text-[#555]'}`}
            >
              RU
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {DOC_SECTIONS.map((section, i) => (
            <div key={i} className="mb-6">
              <h5 className="text-[10px] uppercase tracking-widest text-[#555] font-bold mb-3 px-3">
                {section.category}
              </h5>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-[#C8A96E1A] text-[#C8A96E] font-medium' 
                          : 'text-[#A8A49B] hover:text-[#EDEBE5] hover:bg-[#161616]'
                        }`}
                    >
                      <Icon size={16} className={isActive ? 'text-[#C8A96E]' : 'text-[#555]'} />
                      <span className="text-left flex-1">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 relative h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-24 lg:px-12 lg:py-16">
          <div className="text-[11px] uppercase tracking-widest text-[#C8A96E] mb-2 flex items-center gap-2">
            Documentation <ArrowRight size={12} className="opacity-50" /> {activeSection.replace('-', ' ')}
          </div>
          
          <div className="animate-in fade-in fill-mode-forwards duration-500">
            {renderContent()}
          </div>

          <div className="mt-20 pt-8 border-t border-[#333] flex justify-between items-center text-sm text-[#555]">
            <p>Landing Pro Architecture &copy; 2026</p>
            <p>Built with Next.js 16 Turbopack</p>
          </div>
        </div>
      </main>

    </div>
  );
}
