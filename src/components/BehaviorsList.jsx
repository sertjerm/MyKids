
// src/components/behaviors/BehaviorsList.jsx


const BehaviorsList = ({ familyId, childId, onActivityRecorded }) => {
  const [behaviors, setBehaviors] = useState([]);
  const [behaviorStates, setBehaviorStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [recordingId, setRecordingId] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Good');

  useEffect(() => {
    if (familyId) {
      loadBehaviors();
    }
  }, [familyId]);

  useEffect(() => {
    if (behaviors.length > 0 && childId) {
      checkAllBehaviors();
    }
  }, [behaviors, childId]);

  const loadBehaviors = async () => {
    try {
      setLoading(true);
      const data = await getBehaviors(familyId);
      setBehaviors(data);
    } catch (err) {
      setError('Failed to load behaviors');
    } finally {
      setLoading(false);
    }
  };

  const checkAllBehaviors = async () => {
    const today = new Date().toISOString().split('T')[0];
    const states = {};
    
    for (const behavior of behaviors) {
      try {
        const canPerform = await checkCanPerformBehavior(childId, behavior.Id, today);
        states[behavior.Id] = canPerform;
      } catch (err) {
        states[behavior.Id] = false;
      }
    }
    
    setBehaviorStates(states);
  };

  const handleRecordActivity = async (behavior) => {
    if (!childId) return;
    
    setRecordingId(behavior.Id);
    
    try {
      const result = await recordActivity({
        ChildId: childId,
        ItemId: behavior.Id,
        ActivityType: behavior.Type,
        Note: `${behavior.Type === 'Good' ? 'ทำ' : 'ไม่ทำ'}${behavior.Name}`
      });
      
      // Update behavior state
      setBehaviorStates(prev => ({
        ...prev,
        [behavior.Id]: behavior.IsRepeatable ? true : false
      }));
      
      if (onActivityRecorded) {
        onActivityRecorded(result);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setRecordingId(null);
    }
  };

  const filteredBehaviors = behaviors.filter(b => b.Type === activeTab);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('Good')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'Good'
              ? 'bg-green-500 text-white shadow-md'
              : 'text-gray-600 hover:text-green-600'
          }`}
        >
          😊 พฤติกรรมดี
        </button>
        <button
          onClick={() => setActiveTab('Bad')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'Bad'
              ? 'bg-red-500 text-white shadow-md'
              : 'text-gray-600 hover:text-red-600'
          }`}
        >
          😞 พฤติกรรมไม่ดี
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Behaviors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBehaviors.map(behavior => (
          <BehaviorCard
            key={behavior.Id}
            behavior={behavior}
            canPerform={behaviorStates[behavior.Id] !== false}
            onRecord={handleRecordActivity}
            loading={recordingId === behavior.Id}
          />
        ))}
      </div>

      {filteredBehaviors.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">
            {activeTab === 'Good' ? '😊' : '😞'}
          </div>
          <p>ยังไม่มี{activeTab === 'Good' ? 'พฤติกรรมดี' : 'พฤติกรรมไม่ดี'}ในครอบครัว</p>
        </div>
      )}
    </div>
  );
};
export default BehaviorsList;
