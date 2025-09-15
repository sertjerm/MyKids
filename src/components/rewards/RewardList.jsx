
const RewardsList = ({ familyId, childId, onRewardRedeemed }) => {
  const [rewards, setRewards] = useState([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [rewardStates, setRewardStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (familyId) {
      loadRewards();
    }
  }, [familyId]);

  useEffect(() => {
    if (rewards.length > 0 && childId) {
      loadCurrentPoints();
      checkAllRewards();
    }
  }, [rewards, childId]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const data = await getRewards(familyId);
      setRewards(data);
    } catch (err) {
      setError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPoints = async () => {
    try {
      const points = await getCurrentPoints(childId);
      setCurrentPoints(points);
    } catch (err) {
      console.error('Failed to load current points:', err);
    }
  };

  const checkAllRewards = async () => {
    const states = {};
    
    for (const reward of rewards) {
      try {
        const canRedeem = await checkCanRedeemReward(childId, reward.Id);
        states[reward.Id] = canRedeem;
      } catch (err) {
        states[reward.Id] = false;
      }
    }
    
    setRewardStates(states);
  };

  const handleRedeemReward = async (reward) => {
    if (!childId) return;
    
    setRedeemingId(reward.Id);
    
    try {
      const result = await recordActivity({
        ChildId: childId,
        ItemId: reward.Id,
        ActivityType: 'Reward',
        Note: `แลกรางวัล: ${reward.Name}`
      });
      
      // Update points and states
      setCurrentPoints(prev => prev - reward.Cost);
      await checkAllRewards();
      
      if (onRewardRedeemed) {
        onRewardRedeemed(result);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setRedeemingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Points Display */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">คะแนนปัจจุบัน</h2>
        <div className="text-4xl font-bold text-purple-600">{currentPoints}</div>
        <div className="text-sm text-gray-600">คะแนน</div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map(reward => (
          <RewardCard
            key={reward.Id}
            reward={reward}
            canRedeem={rewardStates[reward.Id] !== false}
            onRedeem={handleRedeemReward}
            loading={redeemingId === reward.Id}
            currentPoints={currentPoints}
          />
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">🎁</div>
          <p>ยังไม่มีรางวัลในครอบครัว</p>
        </div>
      )}
    </div>
  );
};

export default RewardsList;