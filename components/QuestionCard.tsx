import React from 'react';
import { Question, Difficulty } from '../types';
import MathRenderer from './MathRenderer';
import { CheckCircle2, XCircle, Lightbulb, PenTool } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedOption: number | undefined;
  onSelect: (optionIndex: number) => void;
  isReviewMode?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  index, 
  selectedOption, 
  onSelect, 
  isReviewMode = false 
}) => {
  
  const getDifficultyColor = (diff: Difficulty) => {
    switch(diff) {
      case Difficulty.NB: return 'bg-green-100 text-green-800 border-green-200';
      case Difficulty.TH: return 'bg-blue-100 text-blue-800 border-blue-200';
      case Difficulty.VD: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm">
            {index + 1}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            {question.category}
          </span>
        </div>
        <div className="text-xs text-gray-400">
           ID: {question.id.split('-')[1]}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6 text-gray-800 text-lg">
          <MathRenderer content={question.content} />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((opt, optIndex) => {
            let cardClass = "relative p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 hover:bg-gray-50";
            let indicator = <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5" />;
            
            if (isReviewMode) {
              cardClass += " cursor-default hover:bg-white";
              const isCorrect = optIndex === question.correctAnswer;
              const isSelected = optIndex === selectedOption;

              if (isCorrect) {
                cardClass += " border-green-500 bg-green-50/50";
                indicator = <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />;
              } else if (isSelected) {
                cardClass += " border-red-500 bg-red-50/50";
                indicator = <XCircle className="w-5 h-5 text-red-600 mt-0.5" />;
              } else {
                cardClass += " border-gray-100 opacity-60";
              }
            } else {
              // Playing mode
              if (selectedOption === optIndex) {
                cardClass += " border-blue-600 bg-blue-50";
                indicator = <div className="w-5 h-5 rounded-full border-[6px] border-blue-600 mt-0.5" />;
              } else {
                cardClass += " border-gray-200";
              }
            }

            return (
              <div 
                key={optIndex} 
                onClick={() => !isReviewMode && onSelect(optIndex)}
                className={cardClass}
              >
                {indicator}
                <div className="flex-1 text-gray-700">
                  <MathRenderer content={opt} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Review Section */}
        {isReviewMode && (
          <div className="mt-8 border-t border-gray-100 pt-6 animate-fade-in">
             <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Lời giải chi tiết
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`${question.geometrySvg ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-800 text-sm leading-relaxed">
                  <MathRenderer content={question.explanation} />
                </div>

                {question.solutionMethod2 && (
                  <div className="mt-4">
                     <h5 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                      <PenTool className="w-3 h-3" /> Cách giải 2
                     </h5>
                     <div className="bg-blue-50/50 p-4 rounded-lg text-gray-800 text-sm leading-relaxed border border-blue-100">
                      <MathRenderer content={question.solutionMethod2} />
                    </div>
                  </div>
                )}
              </div>

              {/* Geometry Visualization */}
              {question.geometrySvg && (
                <div className="lg:col-span-1 flex flex-col items-center">
                  <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm w-full aspect-square flex items-center justify-center">
                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: question.geometrySvg }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">Hình minh họa</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;