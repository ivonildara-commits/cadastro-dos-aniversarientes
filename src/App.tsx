import { useEffect, useState } from 'react';
import { getSupabase } from './lib/supabase';
import { Birthday, BirthdayStatus, NewBirthday } from './types';
import { BirthdayForm } from './components/BirthdayForm';
import { BirthdayList } from './components/BirthdayList';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Cake, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function App() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch birthdays
  const fetchBirthdays = async () => {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('birthdays')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setBirthdays(data || []);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      toast.error('Erro ao carregar aniversariantes. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdays();

    // Set up real-time subscription
    let channel: any;
    try {
      const supabase = getSupabase();
      channel = supabase
        .channel('public:birthdays')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'birthdays' }, () => {
          fetchBirthdays();
        })
        .subscribe();
    } catch (e) {
      console.warn('Supabase real-time subscription skipped:', e);
    }

    return () => {
      if (channel) {
        try {
          const supabase = getSupabase();
          supabase.removeChannel(channel);
        } catch (e) {}
      }
    };
  }, []);

  const handleAddBirthday = async (newBirthday: NewBirthday) => {
    try {
      setIsSubmitting(true);
      const supabase = getSupabase();
      const { error } = await supabase
        .from('birthdays')
        .insert([newBirthday]);

      if (error) throw error;
      toast.success('Aniversariante cadastrado com sucesso!');
    } catch (error) {
       console.error('Error adding birthday:', error);
       toast.error('Erro ao cadastrar. Verifique sua configuração do Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: BirthdayStatus) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('birthdays')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      if (status === 'concluido') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
        toast.success('Parabéns! Aniversário concluído! 🎂');
      } else {
        toast.info(`Status atualizado para: ${status}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('birthdays')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.info('Aniversariante removido.');
    } catch (error) {
      console.error('Error deleting birthday:', error);
      toast.error('Erro ao remover aniversariante.');
    }
  };

  const filteredBirthdays = birthdays.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-indigo-50 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="h-20 bg-white border-b-4 border-indigo-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg transform -rotate-3 transition-transform hover:rotate-0">
            🎂
          </div>
          <div>
            <h1 className="text-2xl font-black text-indigo-900 leading-tight">CELEBRA BOARD</h1>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Gestão de Aniversariantes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase bg-indigo-50 px-3 py-1.5 rounded-full border-2 border-indigo-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Supabase Online
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border-2 border-indigo-200">
            <span className="font-black text-sm">?</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Left side: Form & Kanban */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Form Card */}
          <Card className="rounded-3xl shadow-xl shadow-indigo-200/50 border-4 border-indigo-100 overflow-hidden bg-white">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-black text-indigo-900">Novo Registro</CardTitle>
              <CardDescription className="text-xs font-bold text-indigo-400 uppercase">Adicione um novo aniversariante</CardDescription>
            </CardHeader>
            <CardContent>
              <BirthdayForm onAdd={handleAddBirthday} isSubmitting={isSubmitting} />
            </CardContent>
          </Card>

          {/* List/Kanban Header */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <h2 className="text-xl font-black text-indigo-900 uppercase tracking-wide">
                Painel de Celebrações
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 transition-colors group-hover:text-indigo-600" />
                  <Input 
                    placeholder="Pesquisar..." 
                    className="pl-9 bg-white border-2 border-indigo-100 rounded-xl focus:border-indigo-400 transition-all text-sm h-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-white border-2 border-indigo-100 rounded-xl h-10 text-xs font-bold text-indigo-900">
                    <SelectValue placeholder="Filtrar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-indigo-100">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="não iniciado">Não Iniciado</SelectItem>
                    <SelectItem value="em andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <BirthdayList 
              birthdays={filteredBirthdays} 
              onStatusChange={handleStatusChange} 
              onDelete={handleDelete}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Right side: Sidebar Stats */}
        <aside className="w-full lg:w-72 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-indigo-100">
            <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Resumo Mensal
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-2xl border-2 border-indigo-100">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Total</span>
                <span className="text-lg font-black text-indigo-600">{birthdays.length}</span>
              </div>
              <div className="flex justify-between items-center bg-rose-50 p-3 rounded-2xl border-2 border-rose-100">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Pendentes</span>
                <span className="text-lg font-black text-rose-500">
                  {birthdays.filter(b => b.status === "não iniciado").length}
                </span>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                  <span>Progresso</span>
                  <span>{Math.round((birthdays.filter(b => b.status === 'concluido').length / (birthdays.length || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(52,211,153,0.4)]" 
                    style={{ width: `${(birthdays.filter(b => b.status === 'concluido').length / (birthdays.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                🚀
              </div>
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Status Deploy</p>
              <p className="text-sm font-black mb-1">Vercel Production</p>
              <p className="text-[10px] opacity-60">Build: v1.1.0-stable</p>
            </div>
          </div>

          <footer className="h-10 px-4 flex items-center justify-center text-[10px] font-black text-indigo-300 uppercase tracking-tighter">
            Aniversariantes App • github.com
          </footer>
        </aside>
      </main>
    </div>
  );
}
