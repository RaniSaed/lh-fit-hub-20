import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, Activity, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, Legend,
    RadialBarChart, RadialBar
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Types passed from the parent component
import type { ProgressEntry, User } from '@/services/mockData';

interface ProgressAnalyticsProps {
    activeProgress: ProgressEntry;
    progressHistory: ProgressEntry[];
    user: User | null;
}

const CircularMetricCard = ({
    label,
    value,
    unit,
    max,
    colorClass = "text-primary"
}: {
    label: string,
    value: string | undefined,
    unit: string,
    max: number,
    colorClass?: string
}) => {
    const numValue = parseFloat(value || '0');
    // Calculate percentage (capped at 100% just for the visual ring)
    const percentage = Math.min((numValue / max) * 100, 100);
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="glass rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group border border-border/40">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* SVG Ring */}
            <div className="relative w-24 h-24 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Track */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/30"
                    />
                    {/* Animated Foreground Progress */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className={colorClass}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{
                            strokeDasharray: circumference,
                        }}
                    />
                </svg>

                {/* Center Value Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-display font-bold text-foreground">
                        {value || '-'}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground -mt-1">
                        {value ? unit : ''}
                    </span>
                </div>
            </div>

            {/* Label Below */}
            <span className="text-sm font-semibold text-foreground text-center z-10 w-full truncate px-1">
                {label}
            </span>
        </div>
    );
};

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ activeProgress, progressHistory, user }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Parse history data into numbers for Recharts Area charts
    const historyData = [...progressHistory]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(p => ({
            date: p.date,
            weight: parseFloat(p.weight) || 0,
            fatPercent: parseFloat(p.fatPercent) || 0,
        }));

    // Stunning unified Full Body Symmetry data for Polar Area
    const fullBodySymmetryData = [
        { subject: 'חזה', value: parseFloat(activeProgress.chest) || 0, fullMark: 140 },
        { subject: 'זרוע ימין', value: parseFloat(activeProgress.rightArm) || 0, fullMark: 60 },
        { subject: 'בטן עליונה', value: parseFloat(activeProgress.upperAbs) || 0, fullMark: 120 },
        { subject: 'בטן אמצע', value: parseFloat(activeProgress.midAbs) || 0, fullMark: 120 },
        { subject: 'בטן תחתונה', value: parseFloat(activeProgress.lowerAbs) || 0, fullMark: 120 },
        { subject: 'עכוז', value: parseFloat(activeProgress.glutes) || 0, fullMark: 130 },
        { subject: 'ירך ימין', value: parseFloat(activeProgress.rightThigh) || 0, fullMark: 80 },
        { subject: 'ירך שמאל', value: parseFloat(activeProgress.leftThigh) || 0, fullMark: 80 },
        { subject: 'זרוע שמאל', value: parseFloat(activeProgress.leftArm) || 0, fullMark: 60 },
    ];

    const handleDownloadPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });

        doc.setFontSize(16);
        doc.text('Progress Tracker', 14, 15);
        doc.setFontSize(11);
        doc.text(`Client: ${user?.username || ''}`, 14, 24);
        doc.text(`Date: ${activeProgress.date}${activeProgress.endDate ? ' → ' + activeProgress.endDate : ''}`, 14, 31);

        const columns = [
            { label: 'Date', key: 'date' },
            { label: 'End Date', key: 'endDate' },
            { label: 'Weight (kg)', key: 'weight' },
            { label: 'Fat %', key: 'fatPercent' },
            { label: 'Upper Abs', key: 'upperAbs' },
            { label: 'Mid Abs', key: 'midAbs' },
            { label: 'Lower Abs', key: 'lowerAbs' },
            { label: 'Right Arm', key: 'rightArm' },
            { label: 'Left Arm', key: 'leftArm' },
            { label: 'Right Thigh', key: 'rightThigh' },
            { label: 'Left Thigh', key: 'leftThigh' },
            { label: 'Glutes', key: 'glutes' },
            { label: 'Chest', key: 'chest' },
        ];

        const sortedHistory = [...progressHistory].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        autoTable(doc, {
            startY: 38,
            head: [columns.map(c => c.label)],
            body: sortedHistory.map(entry => columns.map(c => (entry as any)[c.key] || '')),
            headStyles: {
                fillColor: [16, 127, 123],
                halign: 'center',
            },
            styles: {
                halign: 'center',
            },
        });

        doc.save(`ProgressTracker_${user?.username || 'Client'}_${activeProgress.date}.pdf`);
    };

    return (
        <div className="space-y-6 mt-2">
            {/* Action Header */}
            <div className="flex justify-between items-center glass p-5 rounded-3xl border border-border/40 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BarChart2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-display font-semibold text-foreground">Analytics Report</h2>
                        <p className="text-xs text-muted-foreground">Date: {activeProgress.date}</p>
                    </div>
                </div>
                <Button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="gradient-pink text-white shadow-pink hover:opacity-90 border-transparent transition-all font-bold"
                >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? 'Generating...' : 'Download PDF'}
                </Button>
            </div>

            {/* Wrapping the PDF export area in a div so html2canvas renders only this precisely formatted block */}
            <div ref={printRef} className="space-y-6 pt-1 pb-4 bg-background px-0.5">
                {/* Print Header (Visible mostly in PDF but integrates well directly via styling) */}
                <div className="hidden print:block text-center mb-6">
                    <h1 className="text-2xl font-display font-bold text-foreground">LH Training Analytics</h1>
                    <p className="text-sm text-muted-foreground">Client: {user?.username} | Report Date: {activeProgress.date}</p>
                </div>

                {/* Number Display Grid in Hebrew (Native RTL) */}
                <div dir="rtl" className="space-y-6">
                    {/* Top KPIs: Weight & Body Fat as Large Rings */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        {/* Weight Ring */}
                        <div className="glass rounded-3xl p-6 shadow-md flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group border border-border/40">
                            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative w-32 h-32 mb-4">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                                    <motion.circle
                                        cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                                        className="text-secondary"
                                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                        animate={{ strokeDashoffset: Math.max(0, 2 * Math.PI * 40 - (Math.min((parseFloat(activeProgress.weight || '0') / 120), 1) * 2 * Math.PI * 40)) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        style={{ strokeDasharray: 2 * Math.PI * 40 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Activity className="w-4 h-4 text-secondary mb-0.5" />
                                    <span className="text-3xl font-display font-bold text-foreground leading-none">{activeProgress.weight || '-'}</span>
                                    <span className="text-xs font-medium text-muted-foreground mt-0.5">ק״ג</span>
                                </div>
                            </div>
                            <span className="text-lg font-semibold text-foreground flex items-center gap-2 z-10">
                                משקל
                            </span>
                        </div>

                        {/* Body Fat Ring */}
                        <div className="glass rounded-3xl p-6 shadow-md flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group border border-border/40">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative w-32 h-32 mb-4">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                                    <motion.circle
                                        cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                                        className="text-primary"
                                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                        animate={{ strokeDashoffset: Math.max(0, 2 * Math.PI * 40 - (Math.min((parseFloat(activeProgress.fatPercent || '0') / 40), 1) * 2 * Math.PI * 40)) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        style={{ strokeDasharray: 2 * Math.PI * 40 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-primary mb-0.5" />
                                    <span className="text-3xl font-display font-bold text-foreground leading-none">{activeProgress.fatPercent || '-'}</span>
                                    <span className="text-xs font-medium text-muted-foreground mt-0.5">%</span>
                                </div>
                            </div>
                            <span className="text-lg font-semibold text-foreground flex items-center gap-2 z-10">
                                אחוז שומן
                            </span>
                        </div>
                    </div>

                    {/* Detailed Measurements Grid with Progress Rings */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <CircularMetricCard label="בטן עליונה" value={activeProgress.upperAbs} unit="ס״מ" max={120} colorClass="text-emerald-400" />
                        <CircularMetricCard label="בטן אמצע" value={activeProgress.midAbs} unit="ס״מ" max={120} colorClass="text-emerald-500" />
                        <CircularMetricCard label="בטן תחתונה" value={activeProgress.lowerAbs} unit="ס״מ" max={120} colorClass="text-emerald-600" />
                        <CircularMetricCard label="חזה" value={activeProgress.chest} unit="ס״מ" max={140} colorClass="text-indigo-400" />

                        <CircularMetricCard label="זרוע ימין" value={activeProgress.rightArm} unit="ס״מ" max={60} colorClass="text-sky-400" />
                        <CircularMetricCard label="זרוע שמאל" value={activeProgress.leftArm} unit="ס״מ" max={60} colorClass="text-sky-500" />

                        <CircularMetricCard label="ירך ימין" value={activeProgress.rightThigh} unit="ס״מ" max={80} colorClass="text-amber-400" />
                        <CircularMetricCard label="ירך שמאל" value={activeProgress.leftThigh} unit="ס״מ" max={80} colorClass="text-amber-500" />

                        <CircularMetricCard label="עכוז" value={activeProgress.glutes} unit="ס״מ" max={130} colorClass="text-rose-400" />
                    </div>
                </div>

                {/* Centralized Full Body Symmetry Polygon */}
                <div className="mt-8 print:hidden">
                    <div className="glass rounded-[40px] p-6 md:p-10 shadow-xl flex flex-col items-center relative overflow-hidden group border border-border/30">
                        <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 via-transparent to-primary/5 pointer-events-none" />

                        <div className="text-center mb-6 z-10">
                            <h3 className="text-2xl font-display font-bold text-foreground flex items-center justify-center gap-3">
                                <span className="w-3 h-3 rounded-full gradient-pink inline-block shadow-pink" />
                                סימטריית גוף
                                <span className="w-3 h-3 rounded-full gradient-blue inline-block shadow-blue" />
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2">ניתוח איזון מקיף (ס״מ)</p>
                        </div>

                        <div className="w-full h-96 max-w-2xl z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={fullBodySymmetryData}>
                                    <defs>
                                        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                            <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                                        </radialGradient>
                                    </defs>
                                    {/* The web background */}
                                    <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                                    {/* The text labels around the circle */}
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fontSize: 14, fill: 'hsl(var(--foreground))', fontWeight: 600 }}
                                    />
                                    {/* Hide the radius markers to keep it clean */}
                                    <PolarRadiusAxis
                                        angle={90}
                                        domain={[0, 'auto']}
                                        tick={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                                    />
                                    {/* The actual colored shape */}
                                    <Radar
                                        name="מדידה (ס״מ)"
                                        dataKey="value"
                                        stroke="url(#radarFill)"
                                        strokeWidth={3}
                                        fill="url(#radarFill)"
                                        fillOpacity={0.6}
                                        className="drop-shadow-lg transition-all duration-500 hover:fill-opacity-80"
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};
