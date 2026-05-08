import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Birthday, BirthdayStatus } from '@/src/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Calendar as CalendarIcon, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BirthdayListProps {
  birthdays: Birthday[];
  onStatusChange: (id: string, status: BirthdayStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const BirthdayList: React.FC<BirthdayListProps> = ({ 
  birthdays, 
  onStatusChange, 
  onDelete,
  isLoading
}) => {
  const columns: { status: BirthdayStatus; label: string; color: string; icon: any }[] = [
    { status: 'não iniciado', label: 'Não Iniciado', color: 'rose', icon: AlertCircle },
    { status: 'em andamento', label: 'Em Andamento', color: 'amber', icon: Clock },
    { status: 'concluido', label: 'Concluído', color: 'emerald', icon: CheckCircle2 },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-indigo-900 font-black animate-pulse uppercase tracking-widest text-xs">Sincronizando Dados...</p>
      </div>
    );
  }

  if (birthdays.length === 0) {
    return (
      <div className="text-center p-16 border-4 border-dashed border-indigo-100 rounded-[3rem] bg-indigo-50/30">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-4xl transform rotate-12">
            🎈
          </div>
        </div>
        <h3 className="text-xl font-black text-indigo-900">O quadro está vazio!</h3>
        <p className="text-indigo-400 font-bold text-sm uppercase tracking-wider mt-2">Adicione alguém para começar a celebração</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 px-1 min-h-[600px]">
      {columns.map((column) => {
        const items = birthdays.filter(b => b.status === column.status);
        const ColorIcon = column.icon;
        
        return (
          <div key={column.status} className="flex-1 min-w-[300px] flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${column.color}-400 shadow-[0_0_8px_var(--color-${column.color}-400)]`} />
                <h2 className={`font-black text-${column.color}-900 uppercase tracking-wide text-xs`}>{column.label}</h2>
              </div>
              <span className={`bg-${column.color}-100 text-${column.color}-600 px-3 py-0.5 rounded-full text-[10px] font-black border border-${column.color}-200`}>
                {items.length}
              </span>
            </div>
            
            <ScrollArea className={`flex-1 bg-${column.color}-50/30 rounded-[2rem] border-2 border-dashed border-${column.color}-200 p-4`}>
              <div className="flex flex-col gap-4">
                {items.map((birthday) => (
                  <div key={birthday.id} className="bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-indigo-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <User className="h-4 w-4" />
                        </div>
                        <h3 className="font-black text-slate-800 text-sm group-hover:text-indigo-900 transition-colors">{birthday.name}</h3>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 bg-${column.color}-100 text-${column.color}-700 rounded-lg whitespace-nowrap`}>
                        {format(parseISO(birthday.birth_date), "dd 'de' MMM", { locale: ptBR }).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="w-24">
                        <Select 
                          value={birthday.status} 
                          onValueChange={(value) => onStatusChange(birthday.id, value as BirthdayStatus)}
                        >
                          <SelectTrigger className="h-7 text-[10px] font-black uppercase bg-slate-50 border-none rounded-lg focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2 border-indigo-100">
                            <SelectItem value="não iniciado">Não Iniciado</SelectItem>
                            <SelectItem value="em andamento">Em Andamento</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(birthday.id)}
                          className="h-7 w-7 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className={`py-12 flex flex-col items-center justify-center text-${column.color}-300 opacity-40`}>
                    <ColorIcon className="h-8 w-8 mb-2" />
                    <span className="text-[10px] font-black uppercase">Vazio</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
};
