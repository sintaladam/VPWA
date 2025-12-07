import Channel from "#models/channel";
import { DateTime } from "luxon";


async function checkChannels() {
  console.log('checking channels');
  const threshold = DateTime.now().minus({ days: 30 }).toSQL();
  const channels = await Channel
    .query()
    .whereIn('id', (sub) => {
      sub
        .select('c.id')
        .from('channels as c')
        .leftJoin('messages as m', 'm.channel_id', 'c.id')
        .groupBy('c.id')
        .havingRaw('COALESCE(MAX(m.created_at), c.created_at) < ?', [threshold]);
    });
  
  console.log('deleting ' + channels.length + ' channels');

  await Channel
    .query()
    .whereIn('id', channels.map(ch => ch.id))
    .delete();
}

setTimeout(checkChannels, 60000); //check 60s after startup
setInterval(checkChannels, 3600000); //then check every hour