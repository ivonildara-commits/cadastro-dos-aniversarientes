import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BirthdayStatus, NewBirthday } from '@/src/types';
import { Plus } from 'lucide-react';

interface BirthdayFormProps {
  onAdd: (birthday: NewBirthday) => Promise<void>;
  isSubmitting: boolean;
}

export const BirthdayForm: React.FC<BirthdayFormProps> = ({ onAdd, isSubmitting }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<BirthdayStatus>('não iniciado');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;

    await onAdd({
      name,
      birth_date: date,
      status
    });

    setName('');
    setDate('');
    setStatus('não iniciado');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-black text-indigo-400 uppercase tracking-wider ml-1">Nome</Label>
          <Input 
            id="name" 
            placeholder="Ex: Mariana Silva" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
            className="bg-white border-2 border-indigo-50 rounded-xl focus:border-indigo-400 transition-all h-12 shadow-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs font-black text-indigo-400 uppercase tracking-wider ml-1">Data</Label>
          <Input 
            id="date" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            required
            className="bg-white border-2 border-indigo-50 rounded-xl focus:border-indigo-400 transition-all h-12 shadow-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status" className="text-xs font-black text-indigo-400 uppercase tracking-wider ml-1">Status Base</Label>
          <Select 
            value={status} 
            onValueChange={(value) => setStatus(value as BirthdayStatus)}
          >
            <SelectTrigger id="status" className="bg-white border-2 border-indigo-50 rounded-xl h-12 shadow-sm font-medium">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-indigo-100">
              <SelectItem value="não iniciado" className="font-medium text-rose-600">Não Iniciado</SelectItem>
              <SelectItem value="em andamento" className="font-medium text-amber-600">Em Andamento</SelectItem>
              <SelectItem value="concluido" className="font-medium text-emerald-600">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full md:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-[0_4px_0_rgb(49,46,129)] active:translate-y-[2px] active:shadow-[0_2px_0_rgb(49,46,129)] transition-all flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>CADASTRANDO...</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span>ADICIONAR À LISTA</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
