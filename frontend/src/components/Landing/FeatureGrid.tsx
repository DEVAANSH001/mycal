import React from 'react';
import { CreditCard, Video, Link2, Shield, Languages, Layout, AppWindow, Settings } from 'lucide-react';

const extraFeatures = [
  { icon: <CreditCard className="w-6 h-6" />, label: 'Accept payments' },
  { icon: <Video className="w-6 h-6" />, label: 'Built-in video conferencing' },
  { icon: <Link2 className="w-6 h-6" />, label: 'Short booking links' },
  { icon: <Shield className="w-6 h-6" />, label: 'Privacy first' },
  { icon: <Languages className="w-6 h-6" />, label: '65+ languages' },
  { icon: <Layout className="w-6 h-6" />, label: 'Easy embeds' },
  { icon: <AppWindow className="w-6 h-6" />, label: 'All your favorite apps' },
  { icon: <Settings className="w-6 h-6" />, label: 'Simple customization' },
];

export default function FeatureGrid() {
  return (
    <section className="w-full py-24 px-6 bg-[#F3F4F6]">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-16">
        <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] text-center">
          ...and so much more!
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {extraFeatures.map((feature, i) => (
            <div 
              key={i} 
              className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center gap-6 text-center"
            >
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-900 transition-colors group-hover:bg-gray-100">
                {feature.icon}
              </div>
              <span className="text-sm font-bold text-gray-900 leading-tight">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
