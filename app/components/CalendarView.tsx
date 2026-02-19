'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Repeat,
  Play,
  Pause,
  MoreHorizontal,
  Calendar as CalendarIcon,
  List
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  eachDayOfInterval
} from 'date-fns';

interface ScheduledJob {
  id: string;
  title: string;
  cron: string;
  description: string;
  lastRun?: Date;
  nextRun: Date;
  enabled: boolean;
  agent: string;
}

const mockJobs: ScheduledJob[] = [
  {
    id: '1',
    title: 'Daily Content Pipeline',
    cron: '0 9 * * 1-5',
    description: 'Run content generation every weekday at 9am',
    lastRun: new Date(Date.now() - 86400000),
    nextRun: new Date(Date.now() + 86400000),
    enabled: true,
    agent: 'Claude',
  },
  {
    id: '2',
    title: 'Weekly Report',
    cron: '0 17 * * 5',
    description: 'Generate weekly summary every Friday at 5pm',
    nextRun: new Date(Date.now() + 172800000),
    enabled: true,
    agent: 'Molt',
  },
  {
    id: '3',
    title: 'Health Check',
    cron: '*/30 * * * *',
    description: 'Check system health every 30 minutes',
    lastRun: new Date(Date.now() - 1800000),
    nextRun: new Date(Date.now() + 1800000),
    enabled: false,
    agent: 'Helper',
  },
];

const cronPresets = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at 9am', value: '0 9 * * *' },
  { label: 'Weekdays at 9am', value: '0 9 * * 1-5' },
  { label: 'Weekly on Monday', value: '0 9 * * 1' },
  { label: 'Monthly 1st', value: '0 9 1 * *' },
];

function CalendarGrid({ currentDate, selectedDate, onSelectDate }: { 
  currentDate: Date; 
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Mock events for visual effect
  const hasEvent = (date: Date) => [3, 7, 12, 15, 22, 28].includes(date.getDate());

  return (
    <div className="w-full">
      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-white/40 py-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const hasEvents = hasEvent(day);

          return (
            <motion.button
              key={day.toISOString()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(day)}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center relative
                transition-all duration-200
                ${isCurrentMonth ? 'text-white/80' : 'text-white/20'}
                ${isSelected ? 'bg-cyan-500/30 border border-cyan-500/50' : 'hover:bg-white/5'}
                ${isToday && !isSelected ? 'border border-cyan-500/30' : ''}
              `}
            >
              <span className={`text-sm font-medium ${isToday ? 'text-cyan-400' : ''}`}>
                {format(day, 'd')}
              </span>
              {hasEvents && (
                <div className="absolute bottom-1 flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-cyan-400" />
                  <div className="w-1 h-1 rounded-full bg-purple-400" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function CronWizard({ onClose }: { onClose: () => void }) {
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [generatedCron, setGeneratedCron] = useState('');

  const handleGenerate = () => {
    // Mock natural language to cron conversion
    if (naturalLanguage.toLowerCase().includes('weekday')) {
      setGeneratedCron('0 9 * * 1-5');
    } else if (naturalLanguage.toLowerCase().includes('hour')) {
      setGeneratedCron('0 * * * *');
    } else {
      setGeneratedCron('0 9 * * *');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-white/90">Natural Language Cron</h4>
        <button onClick={onClose} className="text-white/40 hover:text-white/80">×</button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs text-white/50 mb-2 block">Describe when to run</label>
          <input
            type="text"
            value={naturalLanguage}
            onChange={(e) => setNaturalLanguage(e.target.value)}
            placeholder="every weekday at 9am run content pipeline"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {cronPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setNaturalLanguage(preset.label)}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors font-medium"
        >
          Generate Cron
        </button>

        {generatedCron && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
          >
            <p className="text-xs text-cyan-400 mb-1">Generated Cron</p>
            <code className="text-lg font-mono text-white">{generatedCron}</code>
            <p className="text-xs text-white/50 mt-2">Next run: Tomorrow at 9:00 AM</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Calendar & Cron</h2>
          <p className="text-white/50 text-sm mt-1">
            Schedule agents and manage recurring tasks
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                view === 'calendar' ? 'bg-white/10 text-white' : 'text-white/50'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                view === 'list' ? 'bg-white/10 text-white' : 'text-white/50'
              }`}
            >
              <List className="w-4 h-4" />
              Jobs
            </button>
          </div>
          
          <button
            onClick={() => setShowWizard(!showWizard)}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-medium text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Schedule
          </button>
        </div>
      </div>

      {/* Natural Language Wizard */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CronWizard onClose={() => setShowWizard(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar or List */}
        <div className="lg:col-span-2">
          {view === 'calendar' ? (
            <div className="glass p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white/90">
                  {format(currentDate, 'MMMM yyyy')}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white/60" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-sm text-white/80 hover:bg-white/15 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>

              <CalendarGrid 
                currentDate={currentDate} 
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />

              {/* Selected Date Events */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-white/70 mb-3">
                  {format(selectedDate, 'EEEE, MMMM do')}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-sm text-white/70">Daily standup report</span>
                    <span className="ml-auto text-xs text-white/40">9:00 AM</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-sm text-white/70">Content review</span>
                    <span className="ml-auto text-xs text-white/40">2:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Scheduled Jobs</h3>
              <div className="space-y-3">
                {mockJobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-white/90">{job.title}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                            {job.agent}
                          </span>
                        </div>
                        <p className="text-sm text-white/50 mb-2">{job.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <code className="px-2 py-1 rounded bg-white/10 text-cyan-400 font-mono">
                            {job.cron}
                          </code>
                          <span className="text-white/40 flex items-center gap-1">
                            <Repeat className="w-3 h-3" />
                            {format(job.nextRun, 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            job.enabled 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          {job.enabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Upcoming */}
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Upcoming</h3>
          <div className="space-y-4">
            {mockJobs.slice(0, 3).map((job, idx) => (
              <div key={job.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">{job.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {format(job.nextRun, 'MMM d @ h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-medium text-white/60 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                Run All Jobs Now
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Pause All Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
