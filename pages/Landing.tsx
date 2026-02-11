import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">BeautyConnect AI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Funcionalidades</a>
                        <a href="#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Preços</a>
                        <Link to="/auth" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Área do Cliente</Link>
                        <Link to="/auth?mode=register" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20">
                            Começar Agora
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto text-center relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        A IA que escala seu faturamento
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
                        Seu Agente de Atendimento <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">24h por dia</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Esqueça pedidos perdidos. Nossa IA atende, tira dúvidas e agenda seus clientes no WhatsApp enquanto você foca no que importa: o serviço.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/auth?mode=register" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl text-lg font-bold transition-all shadow-xl shadow-primary/30 transform hover:-translate-y-1">
                            Experimentar Grátis
                        </Link>
                        <a href="#demo" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            Ver Demonstração
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-4 bg-white dark:bg-surface-dark border-y border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: 'Agendamentos/mês', value: '15k+' },
                        { label: 'Conversão', value: '+40%' },
                        { label: 'Avaliações Reais', value: '4.9/5' },
                        { label: 'Páginas Criadas', value: '500+' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Desenvolvido para Profissionais</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Uma solução completa para automatizar sua rotina e nunca mais deixar um cliente sem resposta.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: 'chat_bubble',
                                title: 'IA Especialista',
                                desc: 'Treinada especificamente nos serviços de beleza para responder como um humano.'
                            },
                            {
                                icon: 'calendar_month',
                                title: 'Agendamento Direto',
                                desc: 'Sincronização imediata com sua agenda para evitar conflitos de horário.'
                            },
                            {
                                icon: 'payments',
                                title: 'Gestão de Cobrança',
                                desc: 'Lembretes de pagamento e confirmação de reserva automática.'
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 dark:border-slate-800 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[14px]">auto_awesome</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">BeautyConnect AI</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">© 2024 BeautyConnect AI. Todos os direitos reservados.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Termos</a>
                        <a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Privacidade</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
