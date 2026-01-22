import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { generateExamQuestions } from './services/geminiService';
import { Question, ExamState, EXAM_DURATION_SECONDS, SCORE_PER_QUESTION, TOTAL_QUESTIONS } from './types';
import Timer from './components/Timer';
import QuestionCard from './components/QuestionCard';
import { Brain, Trophy, AlertCircle, Loader2, ArrowRight, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<ExamState>({
    status: 'intro',
    questions: [],
    userAnswers: {},
    timeLeft: EXAM_DURATION_SECONDS,
    score: 0
  });

  const [loadingText, setLoadingText] = useState('Đang khởi tạo...');
  const [error, setError] = useState<string | null>(null);

  // Timer Effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (state.status === 'exam' && state.timeLeft > 0) {
      timer = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            handleFinishExam();
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.status, state.timeLeft]);

  const startGeneration = async () => {
    setState(prev => ({ ...prev, status: 'generating' }));
    setError(null);
    setLoadingText('AI đang phân tích ma trận đề thi...');

    try {
      // Simulate steps for UX
      setTimeout(() => setLoadingText('Đang tạo câu hỏi Đại số...'), 1500);
      setTimeout(() => setLoadingText('Đang vẽ hình và tạo câu hỏi Hình học...'), 3500);
      setTimeout(() => setLoadingText('Đang tổng hợp đề thi...'), 6000);

      const questions = await generateExamQuestions();
      
      if (questions.length === 0) {
        throw new Error("Không thể tạo đề thi. Vui lòng kiểm tra API Key.");
      }

      setState(prev => ({
        ...prev,
        status: 'exam',
        questions: questions,
        timeLeft: EXAM_DURATION_SECONDS,
        userAnswers: {},
        score: 0
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
      setState(prev => ({ ...prev, status: 'intro' }));
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    const questionId = state.questions[questionIndex].id;
    setState(prev => ({
      ...prev,
      userAnswers: { ...prev.userAnswers, [questionId]: optionIndex }
    }));
  };

  const handleFinishExam = useCallback(() => {
    // Calculate Score
    let correctCount = 0;
    state.questions.forEach(q => {
      if (state.userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round(correctCount * SCORE_PER_QUESTION * 100) / 100;

    setState(prev => ({
      ...prev,
      status: 'result',
      score: finalScore
    }));
    
    // Scroll to top
    window.scrollTo(0,0);
  }, [state.questions, state.userAnswers]);

  // Render Logic
  const renderContent = () => {
    switch (state.status) {
      case 'intro':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center border border-indigo-100">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Luyện Thi Toán Vào 10
              </h1>
              <p className="text-gray-600 mb-8 text-lg">
                Hệ thống tự động sinh đề thi dựa trên cấu trúc ma trận chuẩn.
                <br />
                <span className="text-sm text-gray-500 mt-2 block">
                  50 câu hỏi • 90 phút • Giải chi tiết • Vẽ hình tự động
                </span>
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <button
                onClick={startGeneration}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 w-full sm:w-auto shadow-lg shadow-indigo-200"
              >
                Bắt đầu làm bài
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <p className="mt-8 text-xs text-gray-400">Powered by Google Gemini AI</p>
          </div>
        );

      case 'generating':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Đang tạo đề thi</h2>
              <p className="text-gray-500 animate-pulse">{loadingText}</p>
            </div>
          </div>
        );

      case 'exam':
        const answeredCount = Object.keys(state.userAnswers).length;
        return (
          <div className="pt-20 pb-24 min-h-screen bg-gray-50">
            <Timer seconds={state.timeLeft} totalSeconds={EXAM_DURATION_SECONDS} />
            
            <div className="container mx-auto px-4 max-w-4xl mt-8">
              {/* Progress Bar (non-sticky) */}
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Bài thi trắc nghiệm</h2>
                  <p className="text-gray-500">Đã làm: {answeredCount}/{TOTAL_QUESTIONS}</p>
                </div>
                <button
                  onClick={handleFinishExam}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Nộp bài sớm
                </button>
              </div>

              {state.questions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={idx}
                  selectedOption={state.userAnswers[q.id]}
                  onSelect={(optIdx) => handleSelectOption(idx, optIdx)}
                />
              ))}

              <div className="flex justify-center mt-10">
                 <button
                  onClick={handleFinishExam}
                  className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Nộp bài và xem kết quả
                </button>
              </div>
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="pt-20 pb-20 min-h-screen bg-gray-50">
             <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 px-4 py-4 border-b border-gray-200">
                <div className="container mx-auto max-w-4xl flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Điểm số của bạn</div>
                        <div className="text-2xl font-bold text-slate-900">{state.score} / 10</div>
                      </div>
                   </div>
                   <button 
                      onClick={() => setState(prev => ({...prev, status: 'intro'}))}
                      className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800"
                    >
                      <RotateCcw className="w-4 h-4" /> Làm đề mới
                   </button>
                </div>
             </div>

             <div className="container mx-auto px-4 max-w-4xl mt-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-blue-800">
                  <h3 className="font-bold flex items-center gap-2 mb-1">
                    <Brain className="w-5 h-5" /> Tổng kết
                  </h3>
                  <p>Bạn đã hoàn thành bài thi. Dưới đây là đáp án chi tiết và giải thích cho từng câu hỏi.</p>
                </div>

                {state.questions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={idx}
                    selectedOption={state.userAnswers[q.id]}
                    onSelect={() => {}}
                    isReviewMode={true}
                  />
                ))}
             </div>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
};

export default App;