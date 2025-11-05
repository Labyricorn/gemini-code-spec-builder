
import React, { useState, useCallback, useMemo } from 'react';
import { AppStage, ActiveTab, ChatMessage, DocumentState, LlmServiceType, LlmService } from './types';
import { GeminiService } from './services/geminiService';
import { OllamaService } from './services/ollamaService';
import { LemonadeService } from './services/lemonadeService';
import { TabButton } from './components/TabButton';
import { DocumentDisplay } from './components/DocumentDisplay';
import { ChatInterface } from './components/ChatInterface';
import { LoadingSpinner, DocumentIcon } from './components/Icons';

// --- New Component: IdeaStage ---
interface IdeaStageProps {
  appIdea: string;
  setAppIdea: (idea: string) => void;
  handleGenerateInitialDoc: () => void;
  isLoading: boolean;
  error: string | null;
  llmServiceType: LlmServiceType;
  setLlmServiceType: (type: LlmServiceType) => void;
  ollamaModel: string;
  setOllamaModel: (model: string) => void;
  lemonadeModel: string;
  setLemonadeModel: (model: string) => void;
}

const IdeaStage: React.FC<IdeaStageProps> = ({ 
  appIdea, setAppIdea, handleGenerateInitialDoc, isLoading, error,
  llmServiceType, setLlmServiceType, ollamaModel, setOllamaModel,
  lemonadeModel, setLemonadeModel
}) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
    <div className="w-full max-w-2xl text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
        AI Code Spec Builder
      </h1>
      <p className="text-lg text-gray-400 mb-8">Turn your idea into a detailed project plan, one step at a time.</p>

      <div className="w-full bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex justify-center border border-gray-700 rounded-lg p-1 mb-4 bg-gray-900/50">
          <button
            onClick={() => setLlmServiceType('gemini')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex-1 transition-colors ${llmServiceType === 'gemini' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Gemini API
          </button>
          <button
            onClick={() => setLlmServiceType('ollama')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex-1 transition-colors ${llmServiceType === 'ollama' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Ollama
          </button>
          <button
            onClick={() => setLlmServiceType('lemonade')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex-1 transition-colors ${llmServiceType === 'lemonade' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Lemonade
          </button>
        </div>

        {llmServiceType === 'ollama' && (
          <div className="mb-4">
              <input 
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="Enter Ollama model name (e.g., llama3)"
                  className="w-full bg-gray-700 text-gray-200 p-3 text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">Make sure your local Ollama server is running at http://localhost:11434</p>
          </div>
        )}
        
        {llmServiceType === 'lemonade' && (
          <div className="mb-4">
              <input 
                  type="text"
                  value={lemonadeModel}
                  onChange={(e) => setLemonadeModel(e.target.value)}
                  placeholder="Enter Lemonade model name (e.g., local-model)"
                  className="w-full bg-gray-700 text-gray-200 p-3 text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">Make sure your local Lemonade server is running at http://localhost:8000</p>
          </div>
        )}

        <textarea
          value={appIdea}
          onChange={(e) => setAppIdea(e.target.value)}
          placeholder="Describe your application idea... e.g., 'A mobile app for tracking personal fitness goals with social sharing features.'"
          className="w-full h-40 bg-gray-700 text-gray-200 p-4 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerateInitialDoc}
          disabled={isLoading || !appIdea.trim() || (llmServiceType === 'ollama' && !ollamaModel.trim()) || (llmServiceType === 'lemonade' && !lemonadeModel.trim())}
          className="mt-4 w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? <LoadingSpinner /> : 'Generate Requirements'}
        </button>
        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      </div>
    </div>
  </div>
);

// --- New Component: DocumentStage ---
interface DocumentStageProps {
  appIdea: string;
  stage: AppStage;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  requirementsDoc: DocumentState;
  designDoc: DocumentState;
  tasksDoc: DocumentState;
  isLoading: boolean;
  chatHistory: ChatMessage[];
  handleSendMessage: (message: string) => void;
  handleApprove: () => void;
  handleDownload: () => void;
  onFinishProject: () => void;
  allDocsApproved: boolean;
}

const DocumentStage: React.FC<DocumentStageProps> = ({
  appIdea,
  stage,
  activeTab,
  setActiveTab,
  requirementsDoc,
  designDoc,
  tasksDoc,
  isLoading,
  chatHistory,
  handleSendMessage,
  handleApprove,
  handleDownload,
  onFinishProject,
  allDocsApproved
}) => {
  const docs = {
    requirements: requirementsDoc,
    design: designDoc,
    tasks: tasksDoc,
  };
  const activeDocument = docs[activeTab];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 p-4 lg:p-6">
      <header className="flex-shrink-0 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Code Spec Builder</h1>
          <p className="text-sm text-gray-400">Your app idea: "{appIdea}"</p>
        </div>
        {allDocsApproved && (
            <button
                onClick={onFinishProject}
                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-all duration-300"
            >
                Finish Project
            </button>
        )}
      </header>

      <div className="flex-shrink-0 mb-4">
        <div className="flex space-x-2 p-1 bg-gray-800 rounded-lg">
          <TabButton label="Requirements" isActive={activeTab === 'requirements'} isComplete={requirementsDoc.isApproved} isDisabled={false} onClick={() => setActiveTab('requirements')} />
          <TabButton label="Design" isActive={activeTab === 'design'} isComplete={designDoc.isApproved} isDisabled={stage < AppStage.DESIGN} onClick={() => setActiveTab('design')} />
          <TabButton label="Dev Tasks" isActive={activeTab === 'tasks'} isComplete={tasksDoc.isApproved} isDisabled={stage < AppStage.TASKS} onClick={() => setActiveTab('tasks')} />
        </div>
      </div>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
        <div className="lg:col-span-3 min-h-0">
          <DocumentDisplay 
            title={activeTab} 
            content={activeDocument.content} 
            isLoading={isLoading && !activeDocument.content}
            isApproved={activeDocument.isApproved}
            onDownload={handleDownload}
          />
        </div>
        <div className="lg:col-span-2 min-h-0">
          <ChatInterface
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            onApprove={handleApprove}
            isLoading={isLoading}
            isApproved={activeDocument.isApproved}
            stageName={activeTab}
          />
        </div>
      </main>
    </div>
  );
};

// --- New Component: CompleteStage ---
interface CompleteStageProps {
  onStartNewProject: () => void;
}

const CompleteStage: React.FC<CompleteStageProps> = ({ onStartNewProject }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4 text-center">
    <DocumentIcon className="w-24 h-24 text-green-400 mb-4" />
    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
      Specification Complete!
    </h1>
    <p className="text-lg text-gray-400 mb-8">You have successfully generated and approved all documents for your app idea.</p>
    <button
      onClick={onStartNewProject}
      className="mt-4 bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 transition-all duration-300"
    >
      Start a New Project
    </button>
  </div>
);


const App: React.FC = () => {
  const [appIdea, setAppIdea] = useState<string>('');
  const [stage, setStage] = useState<AppStage>(AppStage.IDEA);
  const [activeTab, setActiveTab] = useState<ActiveTab>('requirements');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [llmServiceType, setLlmServiceType] = useState<LlmServiceType>('gemini');
  const [ollamaModel, setOllamaModel] = useState<string>('llama3');
  const [lemonadeModel, setLemonadeModel] = useState<string>('');


  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [requirementsDoc, setRequirementsDoc] = useState<DocumentState>({ content: '', isApproved: false });
  const [designDoc, setDesignDoc] = useState<DocumentState>({ content: '', isApproved: false });
  const [tasksDoc, setTaskDoc] = useState<DocumentState>({ content: '', isApproved: false });

  const llmService = useMemo<LlmService>(() => {
    try {
      if (llmServiceType === 'ollama') {
        return new OllamaService(ollamaModel);
      }
      if (llmServiceType === 'lemonade') {
        return new LemonadeService(lemonadeModel);
      }
      return new GeminiService();
    } catch (e: any) {
      setError(e.message);
      // Return a dummy service to prevent app crash
      return {
        generateRequirements: async () => Promise.reject(e),
        refineDocument: async () => Promise.reject(e),
        generateDesign: async () => Promise.reject(e),
        generateTasks: async () => Promise.reject(e),
      }
    }
  }, [llmServiceType, ollamaModel, lemonadeModel]);
  
  const handleGenerateInitialDoc = async () => {
    if (!appIdea.trim()) {
      setError('Please enter an app idea.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { chatResponse, documentContent } = await llmService.generateRequirements(appIdea);
      setRequirementsDoc({ content: documentContent, isApproved: false });
      setChatHistory([{ sender: 'gemini', text: chatResponse }]);
      setStage(AppStage.REQUIREMENTS);
      setActiveTab('requirements');
    } catch (err: any) {
      setError(err.message || 'Failed to generate requirements. Please try again.');
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (message: string) => {
      const newChatHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: message }];
      setChatHistory(newChatHistory);
      setIsLoading(true);
      setError(null);

      try {
          let currentDoc = '';
          if (activeTab === 'requirements') currentDoc = requirementsDoc.content;
          if (activeTab === 'design') currentDoc = designDoc.content;
          if (activeTab === 'tasks') currentDoc = tasksDoc.content;

          const { chatResponse, documentContent } = await llmService.refineDocument(currentDoc, newChatHistory);
          
          setChatHistory(prev => [...prev, { sender: 'gemini', text: chatResponse}]);

          if (activeTab === 'requirements') setRequirementsDoc(prev => ({ ...prev, content: documentContent }));
          if (activeTab === 'design') setDesignDoc(prev => ({ ...prev, content: documentContent }));
          if (activeTab === 'tasks') setTaskDoc(prev => ({ ...prev, content: documentContent }));

      } catch (err: any) {
          setError(err.message || 'Failed to refine document. Please try again.');
          console.error(err);
          setChatHistory(prev => prev.slice(0, -1)); // remove user message on failure
      }
      setIsLoading(false);
  };
  
  const handleApprove = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'requirements' && !requirementsDoc.isApproved) {
            setRequirementsDoc(prev => ({ ...prev, isApproved: true }));
            const { chatResponse, documentContent } = await llmService.generateDesign(requirementsDoc.content);
            setDesignDoc({ content: documentContent, isApproved: false });
            setChatHistory([{ sender: 'gemini', text: chatResponse }]);
            setStage(AppStage.DESIGN);
            setActiveTab('design');
        } else if (activeTab === 'design' && !designDoc.isApproved) {
            setDesignDoc(prev => ({ ...prev, isApproved: true }));
            const { chatResponse, documentContent } = await llmService.generateTasks(requirementsDoc.content, designDoc.content);
            setTaskDoc({ content: documentContent, isApproved: false });
            setChatHistory([{ sender: 'gemini', text: chatResponse }]);
            setStage(AppStage.TASKS);
            setActiveTab('tasks');
        } else if (activeTab === 'tasks' && !tasksDoc.isApproved) {
            setTaskDoc(prev => ({ ...prev, isApproved: true }));
            setChatHistory(prev => [...prev, { sender: 'gemini', text: "All documents are approved. You can download them from each tab and finish the project when ready." }]);
        }
      } catch (err: any) {
        setError(err.message || `Failed to generate the next document. Please try again.`);
        // Revert approval state on failure
        if (activeTab === 'requirements') setRequirementsDoc(prev => ({ ...prev, isApproved: false }));
        if (activeTab === 'design') setDesignDoc(prev => ({ ...prev, isApproved: false }));
        console.error(err);
      }
      setIsLoading(false);
  }, [activeTab, requirementsDoc, designDoc, tasksDoc, llmService]);

  const handleDownload = useCallback(() => {
    const docMap = {
        requirements: requirementsDoc,
        design: designDoc,
        tasks: tasksDoc,
    };
    const doc = docMap[activeTab];

    if (!doc || !doc.isApproved) {
        console.error("Document not available or not approved for download.");
        return;
    }

    const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}, [activeTab, requirementsDoc, designDoc, tasksDoc]);

  const handleStartNewProject = () => {
    setStage(AppStage.IDEA);
    setAppIdea('');
    setRequirementsDoc({ content: '', isApproved: false });
    setDesignDoc({ content: '', isApproved: false });
    setTaskDoc({ content: '', isApproved: false });
    setChatHistory([]);
  };

  const allDocsApproved = requirementsDoc.isApproved && designDoc.isApproved && tasksDoc.isApproved;

  switch (stage) {
    case AppStage.IDEA:
      return <IdeaStage 
        appIdea={appIdea}
        setAppIdea={setAppIdea}
        handleGenerateInitialDoc={handleGenerateInitialDoc}
        isLoading={isLoading}
        error={error}
        llmServiceType={llmServiceType}
        setLlmServiceType={setLlmServiceType}
        ollamaModel={ollamaModel}
        setOllamaModel={setOllamaModel}
        lemonadeModel={lemonadeModel}
        setLemonadeModel={setLemonadeModel}
      />;
    case AppStage.REQUIREMENTS:
    case AppStage.DESIGN:
    case AppStage.TASKS:
      return <DocumentStage 
        appIdea={appIdea}
        stage={stage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        requirementsDoc={requirementsDoc}
        designDoc={designDoc}
        tasksDoc={tasksDoc}
        isLoading={isLoading}
        chatHistory={chatHistory}
        handleSendMessage={handleSendMessage}
        handleApprove={handleApprove}
        handleDownload={handleDownload}
        onFinishProject={() => setStage(AppStage.COMPLETE)}
        allDocsApproved={allDocsApproved}
      />;
    case AppStage.COMPLETE:
      return <CompleteStage onStartNewProject={handleStartNewProject} />;
    default:
      return <IdeaStage 
        appIdea={appIdea}
        setAppIdea={setAppIdea}
        handleGenerateInitialDoc={handleGenerateInitialDoc}
        isLoading={isLoading}
        error={error}
        llmServiceType={llmServiceType}
        setLlmServiceType={setLlmServiceType}
        ollamaModel={ollamaModel}
        setOllamaModel={setOllamaModel}
        lemonadeModel={lemonadeModel}
        setLemonadeModel={setLemonadeModel}
      />;
  }
};

export default App;