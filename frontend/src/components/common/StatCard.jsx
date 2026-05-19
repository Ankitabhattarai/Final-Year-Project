import React from 'react';

const StatCard = ({ title, value, icon }) => {
    return (
        <div className="cl-card p-6 flex items-start gap-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
            <div className="p-4 bg-primary/5 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-primary/10">
                {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
            </div>
            <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">{value}</h3>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
