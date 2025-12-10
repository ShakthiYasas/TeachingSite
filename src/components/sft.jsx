import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, RotateCcw, Code, Cpu, Activity, CheckCircle, Terminal, BookOpen, Layers, AlertTriangle, BarChart, Shield, Zap, DollarSign, ExternalLink } from 'lucide-react';

const RLLLMPresentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // --- STATE (Unchanged) ---
  const [responses, setResponses] = useState([
    { text: "Python is ok I guess", score: null, iteration: 0, logProb: -2.5, reward: 0 },
    { text: "Python is a language", score: null, iteration: 0, logProb: -2.3, reward: 0 },
    { text: "Python is used for coding", score: null, iteration: 0, logProb: -2.7, reward: 0 }
  ]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [trainingHistory, setTrainingHistory] = useState([]);
  
  const [userCode, setUserCode] = useState(`# Implement the reward function
def reward_function(response, target_keywords):
    """
    Calculate reward based on presence of target keywords
    Args:
        response: string - the model's response
        target_keywords: list - important keywords
    Returns:
        float - reward score between 0 and 10
    """
    # TODO: Your code here
    score = 0
    
    return score
`);
  const [codeOutput, setCodeOutput] = useState('');
  const [testsPassed, setTestsPassed] = useState(0);

  // --- LOGIC (Unchanged) ---
  const generateImprovedResponse = (text, score, iteration) => {
    const improvements = [
      "Python is a versatile programming language that's great for beginners.",
      "Python excels in data science, web development, and AI. Its simple syntax makes it beginner-friendly while being powerful for experts.",
      "Learning Python opens doors to careers in data science, ML, web dev, and automation. It has libraries like NumPy, pandas, and TensorFlow—the top choice for modern programming."
    ];
    
    if (score >= 7) return improvements[Math.min(iteration, 2)];
    else if (score >= 4) return improvements[Math.min(Math.max(iteration - 1, 0), 2)];
    else return improvements[0];
  };

  const calculateReward = (score) => score / 10.0;
  const calculateNewLogProb = (oldLogProb, reward, lr = 0.3) => oldLogProb + lr * reward;

  const handleRating = (idx, score) => {
    const newResponses = [...responses];
    newResponses[idx].score = score;
    newResponses[idx].reward = calculateReward(score);
    setResponses(newResponses);
  };

  const runTrainingIteration = () => {
    if (responses.some(r => r.score === null)) {
      alert("Please rate all responses!");
      return;
    }

    setIsTraining(true);
    
    setTimeout(() => {
      const newIteration = currentIteration + 1;
      const improvedResponses = responses.map(r => ({
        text: generateImprovedResponse(r.text, r.score, newIteration),
        score: null,
        iteration: newIteration,
        logProb: calculateNewLogProb(r.logProb, r.reward),
        reward: 0
      }));

      const historyEntry = {
        iteration: currentIteration,
        responses: responses.map(r => ({ text: r.text, score: r.score, reward: r.reward, logProb: r.logProb })),
        avgReward: responses.reduce((sum, r) => sum + r.reward, 0) / responses.length
      };
      setTrainingHistory([...trainingHistory, historyEntry]);
      setResponses(improvedResponses);
      setCurrentIteration(newIteration);
      setIsTraining(false);
    }, 1500);
  };

  const resetDemo = () => {
    setResponses([
      { text: "Python is ok I guess", score: null, iteration: 0, logProb: -2.5, reward: 0 },
      { text: "Python is a language", score: null, iteration: 0, logProb: -2.3, reward: 0 },
      { text: "Python is used for coding", score: null, iteration: 0, logProb: -2.7, reward: 0 }
    ]);
    setCurrentIteration(0);
    setTrainingHistory([]);
  };

  const runCodeTests = () => {
    if (userCode.includes("for") && userCode.includes("in") && userCode.includes("response")) {
      const passed = userCode.includes("lower()") && userCode.includes("normalize") ? 3 : 2;
      setTestsPassed(passed);
      setCodeOutput(`✓ ${passed}/3 tests passed!\n\n${passed === 3 ? 'Perfect! Your reward function correctly matches keywords and normalizes scores.' : 'Good start! Consider case-insensitive matching and normalization.'}`);
    } else {
      setTestsPassed(0);
      setCodeOutput("❌ Tests failed. Loop through keywords and check if each is in the response.");
    }
  };

  // --- HELPER COMPONENTS (Visual Improvements) ---
  
  // UPDATED: Now inherits color ('text-current') by default so it shows up on dark backgrounds
  const MathEq = ({ children, block = false, size = "text-base", color }) => (
    <span className={`font-serif ${block ? 'block w-full text-center my-3' : ''} ${size} ${color ? color : 'text-current'} italic`}>
      {children}
    </span>
  );

  // Helper for non-italic text inside equations
  const T = ({ children }) => <span className="not-italic font-sans ml-1 mr-1">{children}</span>;

  // --- SUB-COMPONENTS ---

  const DemoComponent = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white/80 backdrop-blur border border-purple-100 p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-800">Iteration {currentIteration}</h3>
                {isTraining && <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full animate-pulse">Training...</span>}
            </div>
            {trainingHistory.length > 0 && (
              <p className="text-sm text-slate-500 font-mono mt-1">
                Avg Reward: <span className="text-green-600 font-bold">{trainingHistory[trainingHistory.length - 1].avgReward.toFixed(2)}</span>
              </p>
            )}
          </div>
          <button onClick={resetDemo} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100">
            <RotateCcw size={14} /> Reset Model
          </button>
        </div>
        <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100 text-sm text-purple-900 flex items-center gap-2">
            <Terminal size={16} /> <strong>Prompt:</strong> "Why should I learn Python?"
        </div>
      </div>

      <div className="grid gap-4">
        {responses.map((r, idx) => (
          <div key={idx} className={`relative bg-white border rounded-xl p-5 transition-all duration-300 ${r.score !== null ? 'border-green-200 shadow-md' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
            <div className="absolute top-4 right-4 text-xs font-mono text-slate-400">#{idx + 1}</div>
            <div className="text-slate-700 mb-4 font-medium leading-relaxed">"{r.text}"</div>
            
            {showMath && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600">
                <MathEq block color="text-slate-600">log π_θ(y|x) = {r.logProb.toFixed(3)}</MathEq>
                {r.reward > 0 && (
                   <div className="text-center text-green-600 mt-1">
                       <MathEq color="text-green-700">R(y) = {r.reward.toFixed(3)}</MathEq>
                   </div>
                )}
              </div>
            )}
            
            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rate Quality</span>
                <span className="text-xs text-slate-400">{r.score !== null ? r.score + '/10' : 'Select score'}</span>
              </div>
              <div className="flex justify-between gap-1">
                {[0,1,2,3,4,5,6,7,8,9,10].map(score => (
                  <button
                    key={score}
                    onClick={() => handleRating(idx, score)}
                    className={`
                        w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200
                        ${r.score === score 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' 
                            : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-2">
        <button 
            onClick={() => setShowMath(!showMath)} 
            className="px-5 py-3 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          {showMath ? 'Hide' : 'Show'} Math Details
        </button>
        <button
          onClick={runTrainingIteration}
          disabled={isTraining || responses.some(r => r.score === null)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 ${
            isTraining || responses.some(r => r.score === null)
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:shadow-xl hover:shadow-blue-200'
          }`}
        >
          {isTraining ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Computing Gradients...
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" /> Run RL Update (PPO Step)
            </>
          )}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
        <div className="text-amber-500 mt-1"><Activity size={20} /></div>
        <div>
            <h4 className="text-sm font-bold text-amber-900">Algorithm Logic</h4>
            <div className="text-xs text-amber-800 mt-1 space-y-1">
                <p>1. Ratings are converted to Rewards <MathEq color="text-amber-900">R(y)</MathEq></p>
                <p>2. Gradient Ascent: <MathEq color="text-amber-900">∇_θ J ≈ R(y) · ∇ log π_θ(y|x)</MathEq></p>
            </div>
        </div>
      </div>
    </div>
  );

  const CodingExercise = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl flex items-start gap-4">
        <div className="bg-white/10 p-3 rounded-xl">
            <Code size={24} />
        </div>
        <div>
            <h3 className="font-bold text-xl mb-1">Build a Reward Function</h3>
            <p className="text-slate-300 text-sm">Program the core component of RLHF. Score model outputs based on keyword presence to simulate a preference model.</p>
        </div>
      </div>

      {/* Editor Window */}
      <div className="rounded-xl overflow-hidden border border-slate-300 shadow-2xl bg-[#1e1e1e]">
        <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-black/20">
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-slate-400 text-xs font-mono">reward_function.py</div>
            <div className="w-10"></div>
        </div>
        <div className="flex">
            <div className="bg-[#1e1e1e] text-slate-600 text-right pr-4 py-4 text-xs font-mono select-none border-r border-slate-700/50 w-12">
                {[...Array(15)].map((_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
            </div>
            <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="w-full p-4 bg-[#1e1e1e] text-emerald-400 font-mono text-sm border-none focus:ring-0 outline-none resize-none leading-6"
            rows={15}
            spellCheck={false}
            />
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={runCodeTests} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all">
          <Play size={18} fill="currentColor" /> Run Test Suite
        </button>
        <button
          onClick={() => setUserCode(`def reward_function(response, target_keywords):
    score = 0
    response_lower = response.lower()
    
    for keyword in target_keywords:
        if keyword.lower() in response_lower:
            score += 1
    
    # Normalize to 0-10 scale
    max_score = len(target_keywords)
    if max_score > 0:
        normalized_score = (score / max_score) * 10
    else:
        normalized_score = 0
    
    return normalized_score`)}
          className="px-6 py-3 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
        >
          View Solution
        </button>
      </div>

      {codeOutput && (
        <div className={`p-5 rounded-xl border flex gap-3 ${testsPassed === 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'} animate-slideUp`}>
          {testsPassed === 3 ? <CheckCircle className="shrink-0" /> : <Activity className="shrink-0" />}
          <pre className="text-sm whitespace-pre-wrap font-mono">{codeOutput}</pre>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
        <strong className="block mb-1 text-blue-900">Theory Connection:</strong> 
        This function simulates <MathEq color="text-blue-900">r_φ(x, y)</MathEq>. In real RLHF, this simple function is replaced by a massive neural network trained on thousands of human pairwise comparisons.
      </div>
    </div>
  );

  const slides = [
    {
      title: "LLMs Learning from the Humans",
      subtitle: "Using Reinforcement Learning to fine-tune LLMs",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fadeIn">
          <br/><br/>
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse group-hover:opacity-40 transition-opacity duration-500"></div>
            <img 
              src="/TeachingSite/cover.png" 
              alt="AI Robot"
              className="relative w-32 h-32 object-contain transform hover:scale-110 transition-transform duration-500 drop-shadow-xl" 
            />
          </div>
          <div className="space-y-4 max-w-lg">
             <p className="text-2xl font-light text-slate-600 leading-relaxed">
                From Theory to Practise with <br/><span className="font-semibold text-blue-600">Hands-On Coding</span>
             </p>
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-500">
                <Layers size={16} /> 20 minutes | Complete Deep Dive
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Reinforcement Learning Fundamentals",
      content: (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-blue-50/80 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-xl mb-2 text-blue-900 flex items-center gap-2">
                <Activity size={20} /> Core RL Framework
            </h3>
            <p className="text-slate-700 leading-relaxed">An agent learns <b>optimal behavior</b> through trial-and-error <b>interactions</b> with an environment, guided by <b>feedback</b>.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-100 text-center shadow-sm">
              <div className="text-4xl mb-3">🎯</div>
              <div className="font-bold text-slate-800">Policy <MathEq>π</MathEq></div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">The Possible Actions</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-100 text-center shadow-sm">
              <div className="text-4xl mb-3">🌍</div>
              <div className="font-bold text-slate-800">State <MathEq>s ∈ S</MathEq></div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">The Environmental Context</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-100 text-center shadow-sm">
              <div className="text-4xl mb-3">⭐</div>
              <div className="font-bold text-slate-800">Reward <MathEq>R</MathEq></div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">The Feedback</div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl shadow-inner font-mono text-xs space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Code size={64} /></div>
            <div className="text-white mb-4 font-bold text-sm border-b border-slate-700 pb-2">KEY EQUATIONS</div>
            <div className="flex items-center gap-4">
                <span className="text-blue-400 font-bold">Return:</span> 
                {/* Math color explicitly set to white/light for dark mode */}
                <span><MathEq size="text-sm" color="text-slate-200">G_t = Σ γ^k · R_{`t+k+1`}</MathEq> (discounted cumulative reward)</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-purple-400 font-bold">Value Function:</span>
                <span><MathEq size="text-sm" color="text-slate-200">V^π(s) = E_π[G_t | s_t=s]</MathEq></span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-purple-400 font-bold">Q-Function:</span>
                <span><MathEq size="text-sm" color="text-slate-200">Q^π(s) = E_π[G_t | s_t=s, a_t=a]</MathEq></span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-emerald-400 font-bold">Goal (Optimal Policy):</span>
                <span><MathEq size="text-sm" color="text-slate-200">π* = argmax_π E[G_t]</MathEq></span>
            </div>
            <div className="text-yellow-400 mt-2">γ ∈ [0,1] = discount factor (future vs immediate)</div>
          </div>
        </div>
      )
    },
    {
      title: "The MDP Framework",
      content: (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <h3 className="font-bold text-purple-900 flex items-center gap-2">
                <Layers size={18} /> Markov Decision Process Tuple: <MathEq color="text-purple-900">(S, A, P, R, γ)</MathEq>
            </h3>
          </div>

          <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8 hover:shadow-xl transition-shadow">
            <img 
              src="/TeachingSite/mdp.png" 
              alt="MDP diagram" 
              className="w-full drop-shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <strong>States (S):</strong> All possible situations
            </div>
            <div className="bg-green-50 p-3 rounded">
              <strong>Actions (A):</strong> Available choices
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <strong>Transition (P):</strong> P(s'|s,a) dynamics
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <strong>Reward (R):</strong> R(s,a,s') feedback
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded text-sm">
            <strong>Markov Property:</strong> P(s_{"{t+1}"}|s_t, a_t, s_{"{t-1}"}, ...) = P(s_{"{t+1}"}|s_t, a_t)
            <div className="text-xs text-gray-600 mt-1">Future depends only on present, not history</div>
          </div>
        </div>
      )
    },
    {
      title: "Policy Gradient Methods",
      content: (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
            <h3 className="font-bold text-lg mb-1">Direct Policy Optimization</h3>
            <p className="text-blue-100 text-sm">Instead of learning values (Q), we parameterize the policy <MathEq size="text-white" color="text-white">π_θ</MathEq> and optimize it directly via gradient ascent.</p>
          </div>

          <div className="bg-white border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm">
            <div className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-3">The Policy Gradient Theorem</div>
            <div className="space-y-4">
                <div className="text-center bg-slate-50 py-4 rounded-lg border border-slate-100">
                    <MathEq size="text-xl" color="text-slate-800">
                    ∇_θ J(θ) = E_π [ ∇_θ log π_θ(a|s) · A^π(s,a) ]
                    </MathEq>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                        <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                        <p><MathEq color="text-slate-700">A^π</MathEq> is the Advantage: "How much better was this action than average?"</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                        <p><MathEq color="text-slate-700">∇ log π</MathEq> is the direction to increase probability.</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Terminal size={16} /> REINFORCE Algorithm (Simplified)
            </div>
            <div className="font-mono text-xs space-y-2 text-slate-600 ml-4">
              <div className="flex gap-3"><span className="text-slate-400">1.</span> <span>Sample trajectory <MathEq color="text-slate-600">τ ~ π_θ</MathEq></span></div>
              <div className="flex gap-3"><span className="text-slate-400">2.</span> <span>Compute returns <MathEq color="text-slate-600">G_t</MathEq> for each step</span></div>
              <div className="flex gap-3"><span className="text-slate-400">3.</span> <span>Update: <MathEq color="text-slate-600">θ ← θ + α · Σ_t ∇_θ log π_θ(a_t|s_t) · G_t</MathEq></span></div>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded text-sm">
              <strong>Intuition:</strong> If action led to good outcome (G_t high), increase its probability. If bad outcome, decrease probability.
            </div>
        </div>
      )
    },
    {
      title: "From Traditional RL to LLMs",
      content: (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border-t-4 border-blue-500 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2"><Cpu size={18}/> Game RL (Chess/Go)</h3>
              <div className="text-sm space-y-2 text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>State <MathEq color="text-slate-700">s_t</MathEq></span> <span className="font-medium text-slate-800">Board config</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Action <MathEq color="text-slate-700">a_t</MathEq></span> <span className="font-medium text-slate-800">Move piece</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Space <MathEq color="text-slate-700">|A|</MathEq></span> <span className="font-medium text-slate-800">~10²</span></div>
                <div className="flex justify-between"><span>Reward</span> <span className="font-medium text-green-600">Win/Loss</span></div>
              </div>
            </div>
            
            <div className="bg-white border-t-4 border-emerald-500 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2"><Terminal size={18}/> Language Model RL</h3>
              <div className="text-sm space-y-2 text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>State <MathEq color="text-slate-700">s_t</MathEq></span> <span className="font-medium text-slate-800">Context Window</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Action <MathEq color="text-slate-700">a_t</MathEq></span> <span className="font-medium text-slate-800">Next Token</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Space <MathEq color="text-slate-700">|A|</MathEq></span> <span className="font-medium text-slate-800">~50,000+!</span></div>
                <div className="flex justify-between"><span>Reward</span> <span className="font-medium text-purple-600">Human Preference</span></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl text-slate-300 shadow-xl">
             <div className="font-bold text-white mb-4 border-b border-slate-700 pb-2">LLM as an MDP</div>
             <div className="space-y-3 font-mono text-xs">
                <p><span className="text-purple-400">State:</span> <MathEq size="text-sm" color="text-slate-300">s_t</MathEq> = Context up to position t</p>
                <p><span className="text-purple-400">Action:</span> <MathEq size="text-sm" color="text-slate-300">a_t</MathEq> = token_{"{t+1}"} ∈ V (vocabulary)</p>
                <p><span className="text-purple-400">Policy:</span> <MathEq size="text-sm" color="text-slate-300">π_θ(token | context) = softmax(f_θ(context))</MathEq></p>
                <p><span className="text-purple-400">Episode: </span> Complete sequence generation</p>
                <p><span className="text-emerald-400">Reward:</span> <MathEq size="text-sm" color="text-slate-300">r_T</MathEq> given at the end (e.g., human preference)</p>
                <div className="bg-slate-800/50 p-2 rounded mt-2 border border-slate-700 text-amber-300 flex items-center gap-2">
                    <Activity size={14} /> Main Challenge: Sparse rewards + Massive Action Space
                </div>
             </div>
          </div>

          <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
            <div className="font-semibold text-sm mb-2">Sequence Generation Process:</div>
            <div className="flex items-center gap-2 text-xs overflow-x-auto">
              <div className="bg-blue-100 px-2 py-1 rounded">Prompt</div>
              <span>→</span>
              <div className="bg-green-100 px-2 py-1 rounded">tok_1</div>
              <span>→</span>
              <div className="bg-green-100 px-2 py-1 rounded">tok_2</div>
              <span>→</span>
              <div className="bg-green-100 px-2 py-1 rounded">...</div>
              <span>→</span>
              <div className="bg-green-100 px-2 py-1 rounded">tok_T</div>
              <span>→</span>
              <div className="bg-orange-100 px-2 py-1 rounded">Reward!</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "RLHF: Three-Stage Pipeline",
      content: (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-1 rounded-2xl shadow-lg">
             <div className="bg-white p-5 rounded-xl h-full">
                <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Reinforcement Learning from Human Feedback</h3>
             </div>
          </div>

          <div className="relative py-4">
             {/* Connector Line */}
             <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 transform -translate-y-1/2"></div>
             
             <div className="grid grid-cols-3 gap-4">
                {/* Stage 1 */}
                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-lg flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
                   <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">1</div>
                   <div className="font-bold text-slate-800 text-sm mb-1">SFT</div>
                   <div className="text-xs text-slate-500 mb-2">Supervised Fine-Tuning</div>
                   <div className="bg-blue-50 text-blue-800 text-[10px] px-2 py-1 rounded-full font-mono">Loss: -log P(y|x)</div>
                </div>

                {/* Stage 2 */}
                <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-lg flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
                   <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold mb-3 group-hover:bg-pink-600 group-hover:text-white transition-colors">2</div>
                   <div className="font-bold text-slate-800 text-sm mb-1">Reward Model</div>
                   <div className="text-xs text-slate-500 mb-2">Learn Preferences</div>
                   <div className="bg-pink-50 text-pink-800 text-[10px] px-2 py-1 rounded-full font-mono">y_win {'>'} y_lose</div>
                </div>

                {/* Stage 3 */}
                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-lg flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
                   <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">3</div>
                   <div className="font-bold text-slate-800 text-sm mb-1">PPO</div>
                   <div className="text-xs text-slate-500 mb-2">Optimize Policy</div>
                   <div className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-1 rounded-full font-mono">Max E[R(y)]</div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3 rounded text-xs">
              <div className="font-semibold mb-1">Input:</div>
              <div>Prompts + expert demos</div>
            </div>
            <div className="bg-pink-50 p-3 rounded text-xs">
              <div className="font-semibold mb-1">Input:</div>
              <div>Prompt + pairs (y_w, y_l)</div>
            </div>
            <div className="bg-green-50 p-3 rounded text-xs">
              <div className="font-semibold mb-1">Input:</div>
              <div>Prompts + reward model</div>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm">
             <h4 className="font-bold text-slate-700 mb-2">Deep Dive: Reward Modeling</h4>
             <p className="text-slate-600 mb-3">We train a separate neural network <MathEq color="text-slate-700">r_φ</MathEq> to predict which response a human would prefer.</p>
             <div className="bg-white p-3 rounded border border-slate-200 font-mono text-xs text-slate-600">
                Loss = -E [ log σ ( r_φ(x, y_w) - r_φ(x, y_l) ) ]
             </div>
          </div>
        </div>
      )
    },
    {
      title: "PPO: Proximal Policy Optimization",
      content: (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="font-bold text-emerald-900 mb-2">The Workhorse of RLHF</h3>
            <p className="text-slate-700 text-sm">PPO prevents the model from changing too quickly, ensuring stable training dynamics.</p>
          </div>

          <div className="bg-slate-900 text-emerald-400 p-6 rounded-2xl font-mono text-xs space-y-4 shadow-xl">
            <div>
                <div className="text-white font-bold mb-2">PPO Objective Function</div>
                <div className="bg-slate-800 p-3 rounded border border-slate-700 overflow-x-auto">
                    <MathEq size="text-sm" color="text-emerald-400">
                        L^CLIP(θ) = E[min(r_t(θ)·A_t, clip(r_t(θ), 1-ε, 1+ε)·A_t)]
                    </MathEq>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                    <span className="text-slate-400 block mb-1">Probability Ratio:</span>
                    <MathEq color="text-slate-300">r_t(θ) = π_θ / π_old</MathEq>
                </div>
                <div>
                    <span className="text-slate-400 block mb-1">KL Penalty (Stability):</span>
                    <MathEq color="text-slate-300">J = R - β · KL[π_θ || π_ref]</MathEq>
                </div>
            </div>
          </div>

          <div className="flex gap-4">
             <div className="flex-1 bg-white p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm">
                <div className="font-bold text-sm mb-1">Why Clipping?</div>
                <p className="text-xs text-slate-500">If the new policy is too different (ratio far from 1), the update is clipped to prevent catastrophic forgetting.</p>
             </div>
             <div className="flex-1 bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-sm">
                <div className="font-bold text-sm mb-1">Why KL Divergence?</div>
                <p className="text-xs text-slate-500">Keeps the model "close" to the original SFT model so it doesn't output gibberish just to hack the reward.</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded text-sm">
              <div className="font-semibold mb-2">✓ Why PPO?</div>
              <ul className="text-xs space-y-1">
                <li>• Stable training</li>
                <li>• Prevents drastic updates</li>
                <li>• Sample efficient</li>
              </ul>
            </div>
            <div className="bg-orange-50 p-3 rounded text-sm">
              <div className="font-semibold mb-2">⚡ Key Ideas:</div>
              <ul className="text-xs space-y-1">
                <li>• Clip ratio to [1-ε, 1+ε]</li>
                <li>• KL penalty for stability</li>
                <li>• Multiple epochs on batch</li>
              </ul>
            </div>
          </div>

        </div>
      )
    },
    {
      title: "DPO: Direct Preference Optimization",
      content: (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div>
                <h3 className="font-bold text-indigo-900 mb-1">Simpler. Faster.</h3>
                <p className="text-sm text-indigo-700">Skip the reward model entirely. Optimize directly on preference data.</p>
            </div>
            <div className="text-4xl">🚀</div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div className="font-mono text-xs text-slate-500 mb-2">DPO Loss Function</div>
            <MathEq block size="text-lg" color="text-slate-800">
                L_DPO = -E[log σ(β·log(π_θ(y_w|x)/π_ref(y_w|x)) - β·log(π_θ(y_l|x)/π_ref(y_l|x)))]
            </MathEq>
            <p className="text-xs text-slate-500 mt-4 italic text-center">Essentially: Increase likelihood of preferred response relative to reference model.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 opacity-70 grayscale">
              <div className="font-bold text-sm mb-2 text-slate-500">Legacy (PPO)</div>
              <ul className="text-xs space-y-2 text-slate-400">
                <li className="flex gap-2"><span>1.</span> SFT Training</li>
                <li className="flex gap-2"><span>2.</span> <span className="font-semibold">Train Reward Model</span></li>
                <li className="flex gap-2"><span>3.</span> <span className="font-semibold">PPO Optimization</span></li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 ring-2 ring-green-100">
              <div className="font-bold text-sm mb-2 text-green-800">DPO</div>
              <ul className="text-xs space-y-2 text-slate-600">
                <li className="flex gap-2"><span>1.</span> SFT Training</li>
                <li className="flex gap-2"><span>2.</span> <span className="font-bold text-green-700">Optimize on Preferences</span></li>
                <li className="flex gap-2 opacity-0"><span>3.</span> <span>---</span></li>
              </ul>
            </div>   
          </div>

          <div className="bg-yellow-50 p-3 rounded text-sm">
            <strong>Trade-off:</strong> DPO is simpler but PPO can be more flexible for complex reward functions. Both widely used in practice (Llama 3, Claude, GPT-4).
          </div>
        </div>
      )
    },
    {
      title: "Interactive Demo Introduction",
      subtitle: "See RL in Action",
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fadeIn">
          <div className="text-center space-y-3">
            <div className="inline-block p-4 rounded-full bg-blue-100 text-blue-600 mb-2">
                <Activity size={32} />
            </div>
            <h3 className="text-3xl font-bold text-slate-800">Let's Train a Model!</h3>
            <p className="text-slate-500 max-w-md mx-auto">We will manually simulate the RLHF process for the prompt: <br/><strong>"Why should I learn Python?"</strong></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <div className="font-bold text-slate-700 mb-2 flex gap-2 items-center"><Terminal size={16}/> The Loop</div>
                 <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                    <li>Read model responses</li>
                    <li>Rate them (Reward Function)</li>
                    <li>Update Policy (Gradient Ascent)</li>
                    <li>Watch probabilities change</li>
                 </ol>
              </div>
              <div className="bg-slate-900 text-slate-300 p-5 rounded-xl shadow-lg">
                 <div className="font-bold text-white mb-2 flex gap-2 items-center"><Cpu size={16}/> Under the hood</div>
                 <div className="text-sm font-mono space-y-2">
                    <div>Your ratings → rewards R(y)</div>
                    <div>Update → log π_θ ← log π_θ + α·R</div>
                    <div className="text-xs text-slate-500 mt-2">High rewards increase the probability of similar tokens appearing next time.</div>
                 </div>
              </div>
          </div>

          <button
            onClick={() => setCurrentSlide(9)}
            className="group relative px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
               Start Interactive Demo <ChevronRight size={18} />
            </span>
          </button>
        </div>
      )
    },
    {
      title: "Interactive Demo: RLHF Training",
      content: <DemoComponent />
    },
    {
      title: "Hands-On Coding Exercise",
      content: <CodingExercise />
    },
    {
      title: "Key Challenges in RL for LLMs",
      content: (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
            <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle size={20} /> Reward Hacking
            </h3>
            <p className="text-slate-700 text-sm mb-3">The model finds "loopholes" in the reward model to get a high score without actually being helpful.</p>
            <div className="bg-white/60 p-3 rounded-lg text-xs text-red-800 font-mono border border-red-100">
               Example: Writing 10,000 words because the reward model prefers "comprehensive" answers, even if they are repetitive.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                <div className="font-bold text-amber-900 mb-2 flex items-center gap-2"><BarChart size={16}/> Scalability</div>
                <p className="text-xs text-slate-600">Collecting human preferences is expensive and slow. We need millions of comparisons.</p>
             </div>
             <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-2 flex items-center gap-2"><BookOpen size={16}/> Taxonomy</div>
                <p className="text-xs text-slate-600">"Helpful" vs "Harmless". Often these goals conflict (e.g., explaining how to make poison is helpful but harmful).</p>
             </div>
             <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                <div className="font-bold text-slate-900 mb-2 flex items-center gap-2"><DollarSign  size={16}/> Cost</div>
                <p className="text-xs text-slate-600">Requires 4+ models running simultaneously-policy model, value model, reward model, reference model.</p>
             </div>
          </div>
        </div>
      )
    },
    // --- RESTORED PLACEHOLDERS FOR TRUNCATED CARDS ---
    {
      title: "Evaluation & Benchmarks",
      subtitle: "How do we know it's working?",
      content: (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">The Evaluation Gap</h3>
                <p className="text-slate-700 text-sm">RLHF improves "vibes" but often hurts calibration on factual tasks (the "Alignment Tax").</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="font-bold text-slate-800 mb-2">Elo Ratings</div>
                    <p className="text-xs text-slate-500">Head-to-head battles (e.g., Chatbot Arena). The gold standard for subjective quality.</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="font-bold text-slate-800 mb-2">Auto-Eval</div>
                    <p className="text-xs text-slate-500">Using GPT-4 to grade the output of smaller models (LLM-as-a-Judge).</p>
                </div>
            </div>
        </div>
      )
    },
    {
      title: "Constitutional AI",
      subtitle: "Automating Alignment",
      content: (
        <div className="space-y-6 animate-fadeIn">
             <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center gap-4">
                <Shield size={32} className="text-indigo-600" />
                <div>
                    <h3 className="font-bold text-indigo-900">AI Feedback (RLAIF)</h3>
                    <p className="text-xs text-indigo-700 mt-1">Replace human feedback with AI feedback based on a "Constitution".</p>
                </div>
             </div>
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-sm font-mono text-slate-600 space-y-2">
                    <div className="flex gap-2"><span className="text-slate-400">1.</span> Generate response</div>
                    <div className="flex gap-2"><span className="text-slate-400">2.</span> Critique response based on principles</div>
                    <div className="flex gap-2"><span className="text-slate-400">3.</span> Revise response</div>
                    <div className="flex gap-2"><span className="text-slate-400">4.</span> Train on Revised data</div>
                </div>
             </div>
        </div>
      )
    },
    {
      title: "Open Source RLHF",
      content: (
        <div className="space-y-6 animate-fadeIn">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl">
                    <h3 className="font-bold text-lg mb-2">Tools</h3>
                    <ul className="text-sm space-y-2 text-slate-300">
                        <li>• TRL (HuggingFace)</li>
                        <li>• Axolotl</li>
                        <li>• DeepSpeed Chat</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-slate-800">Datasets</h3>
                    <ul className="text-sm space-y-2 text-slate-600">
                        <li>• HH-RLHF (Anthropic)</li>
                        <li>• UltraChat</li>
                        <li>• OpenAssistant</li>
                    </ul>
                </div>
             </div>
        </div>
      )
    },
    {
      title: "Conclusion & Next Steps",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fadeIn">
             <div className="bg-green-100 p-4 rounded-full text-green-600 mb-2">
                <Zap size={32} />
             </div>
             <h2 className="text-2xl font-bold text-slate-800">You've completed the Deep Dive!</h2>
             <p className="text-slate-600 max-w-md">RLHF is the bridge between a raw next-token predictor and a helpful assistant. You now understand the math, the code, and the challenges.</p>
             
             <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-8">
                <div
                  className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center text-center"
                  onClick={() =>
                    window.open(
                      "https://colab.research.google.com/drive/1qTK3_aljh-bJgfDzvqveVRdXOdODIinS?usp=sharing",
                      "_blank"
                    )
                  }
                >
                  <div className="font-bold text-slate-800 flex items-center gap-1 justify-center">
                    What's Next? <ExternalLink size={14} className="text-slate-500" />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Try the Coding Excercise!</div>
                </div>
                <div
                  className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center text-center"
                  onClick={() =>
                    window.open(
                      "https://proceedings.neurips.cc/paper_files/paper/2022/file/b1efde53be364a73914f58805a001731-Paper-Conference.pdf",
                      "_blank"
                    )
                  }
                >
                  <div className="font-bold text-slate-800 flex items-center gap-1 justify-center">
                    Go Deeper <ExternalLink size={14} className="text-slate-500" />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Read the RLHF Paper</div>
                </div>
             </div>
        </div>
      )
    }
  ];

  const ProgressDots = () => (
    <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, idx) => (
            <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
            />
        ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 font-sans text-slate-800">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col min-h-[700px]">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center bg-opacity-90 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
              {slides[currentSlide].title}
            </h1>
            {slides[currentSlide].subtitle && (
              <p className="text-slate-500 text-sm mt-1 font-medium">{slides[currentSlide].subtitle}</p>
            )}
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-50">
          {slides[currentSlide].content}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronLeft size={18} /> Previous
                </button>
                
                <ProgressDots />

                <button
                    onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === slides.length - 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 transition-all shadow-lg shadow-slate-200"
                >
                    Next <ChevronRight size={18} />
                </button>
            </div>
        </div>
      </div>
      
      {/* CSS for custom animations */}
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slideUp {
            animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RLLLMPresentation;