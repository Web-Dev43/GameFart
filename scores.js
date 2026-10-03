(function () {
  const client = window.supabase.createClient(
    'https://hfdekvptcyjpgjypbakm.supabase.co',
    'sb_publishable_Of_AeC0QNct7de72es504w_X5MBIdHZ'
  );

  async function getRecord(game) {
    const { data, error } = await client.from('game_scores')
      .select('score,player_name,created_at')
      .eq('game_slug', game)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1).maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function startRun(game) {
    const { data, error } = await client.functions.invoke('verify-game-score', {
      body: { action: 'start', game }
    });
    if (error) throw error;
    return data;
  }

  async function submitRun(game, sessionId, score, events) {
    if (!sessionId || !Number.isFinite(score)) return null;
    let name = localStorage.getItem('gf-player-name') || '';
    if (!name) {
      name = window.prompt('NEW WORLD RECORD! Enter your name:', 'Anonymous') || 'Anonymous';
      name = name.trim().slice(0, 20) || 'Anonymous';
      localStorage.setItem('gf-player-name', name);
    }
    const { data, error } = await client.functions.invoke('verify-game-score', {
      body: { action: 'submit', game, sessionId, score: Math.floor(score), playerName: name, events }
    });
    if (error) {
      console.warn('Score verification failed', error);
      return null;
    }
    return data;
  }

  async function fillRecord(game, elements) {
    try {
      const record = await getRecord(game);
      const value = record ? record.score + ' · ' + record.player_name : 'No record yet';
      elements.forEach(el => { el.textContent = value; });
      return record;
    } catch (e) {
      console.warn('World record lookup failed', e);
      elements.forEach(el => { el.textContent = '—'; });
      return null;
    }
  }

  window.GameFartScores = { getRecord, startRun, submitRun, fillRecord };
})();