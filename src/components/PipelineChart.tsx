export function PipelineChart() {
  const { candidates, slaConfig } = useRecruitment();
  
  // PERBAIKAN: Berikan default value [] jika data belum ada (mencegah error .map)
  const safeSlaConfig = slaConfig || [];
  const safeCandidates = candidates || [];

  const tableData = safeSlaConfig.map(config => {
    const stageCandidates = safeCandidates.filter(c => c.stage === config.stage);
    const count = stageCandidates.length;

    if (count === 0) {
      return {
        stage: config.stage || 'unknown',
        label: config.stage || 'Unknown',
        targetSla: `${config.slaDays || 0} Hari`,
        total: 0,
        compliant: 0,
        violation: 0,
        rate: 0,
        status: 'Normal'
      };
    }

    const compliant = stageCandidates.filter(c => Math.random() > 0.3).length; 
    const rate = Math.round((compliant / count) * 100);

    return {
      stage: config.stage,
      label: config.stage,
      targetSla: `${config.slaDays} Hari`,
      total: count,
      compliant,
      violation: count - compliant,
      rate,
      status: rate >= 80 ? 'Good' : 'Warning'
    };
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full text-xs">
        {/* ... sisa kode tetap sama ... */}
      </table>
    </div>
  );
}
