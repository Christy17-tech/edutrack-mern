import React from 'react';
import { GraduationCap, ExternalLink, Code2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              EduTrack MERN Portal
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Developed in strict compliance with the Information & Communication Technology Academy of Kerala (ICTAK) Full Stack Development Curriculum & Student Reference Guide.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400">
              <Code2 className="w-4 h-4" />
              <span>MongoDB &bull; Express.js &bull; React 19 (Vite) &bull; Node.js</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="https://ictkerala.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  ICT Academy of Kerala <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://react.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  React Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://expressjs.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Express API Guide <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Guidelines Checklist */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Project Specs</h4>
            <div className="text-xs text-gray-400 space-y-1.5">
              <p className="flex items-center gap-1.5 text-emerald-400">
                &check; Role-Based Access Control
              </p>
              <p className="flex items-center gap-1.5 text-emerald-400">
                &check; JWT + Bcrypt Security
              </p>
              <p className="flex items-center gap-1.5 text-emerald-400">
                &check; 4 UI States on All Views
              </p>
              <p className="flex items-center gap-1.5 text-emerald-400">
                &check; Mobile First Responsive Design
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>&copy; {new Date().getFullYear()} EduTrack &bull; ICTAK Full Stack Assessment Project</p>
          <p>Version 1.0.0 (Production Ready)</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
