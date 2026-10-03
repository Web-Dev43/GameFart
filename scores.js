(function () {
  const client = window.supabase.createClient(
    'https://hfdekvptcyjpgjypbakm.supabase.co',
    'sb_publishable_Of_AeC0QNct7de72es504w_X5MBIdHZ'
  );

  async function getRecord(game) {
    const { data, error } = await client
      .from('game_scores')
      .select('score,player_name,created_at')
      .eq('game_slug', game)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function submitIfRecord(game, score) {
    if (!Number.isFinite(score) || score <= 0) return null;
    let record = null;
    try { record = await getRecord(game); } catch (e) { console.warn('World record lookup failed', e); return null; }
    if (record && score <= record.score) return record;

    let name = localStorage.getItem('gf-player-name') || '';
    if (!name) {
      name = window.prompt('NEW WORLD RECORD! Enter your name:', 'Anonymous') || 'Anonymous';
      name = name.trim().slice(0, 20) || 'Anonymous';
      localStorage.setItem('gf-player-name', name);
    }

    const { error } = await client.from('game_scores').insert({
      game_slug: game,
      player_name: name,
      score: Math.floor(score)
    });
    if (error) {
      console.warn('World record save failed', error);
      return null;
    }
    return { score: Math.floor(score), player_name: name };
  }

  async function fillRecord(game, elements) {
    try {
      const record = await getRecord(game);
      const text = record ? record.score + ' · ' + record.player_name : 'No record yet';
      elements.forEach(el => { el.textContent = text; });
      return record;
    } catch (e) {
      console.warn('World record lookup failed', e);
      elements.forEach(el => { el.textContent = '—'; });
      return null;
    }
  }

  window.GameFartScores = { getRecord, submitIfRecord, fillRecord };
})();