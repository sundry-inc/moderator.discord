import { ChannelType } from "discord.js";
import { client } from "../bot";
import AutoVoices from "../schemas/AutoVoices";
import ParentVoices from "../schemas/ParentVoices";
import { Event } from "../structures/Event";

export default new Event("voiceStateUpdate", async (oldState, newState) => {
  const data = await ParentVoices.find();
  if (!data) return;
  

  if (newState.channelId == data[0].channel_id) {
    const { guild, user, voice, id } = newState.member;

    const parent = newState.channel.parentId;
    const parentID = parent 
      ? { parent }
      : { };

    const voiceChannel = await guild.channels.create({
      name: `${user.username}'s channel`,
      type: ChannelType.GuildVoice,
      ...parentID,
      permissionOverwrites: [
        {
          id: id,
          allow: [ "Speak", "Stream", "Connect" ]
        },
        {
          id: guild.id,
          allow: [ "Connect" ]
        }
      ]
    })

    client.voiceGenerator.set(voiceChannel.id, newState.member.id);
    voice.setChannel(voiceChannel.id);

    const guildAdminsArray: string[] = [];
    guild.members.cache.map((user) => {
      if (user.permissions.has("Administrator")) return guildAdminsArray.push(user.id);
    });    

    const newChannel = await AutoVoices.create({
      channel_id: voiceChannel.id,
      owner_id: id,
      is_open: true,
      users_limit: null,
      admins: guildAdminsArray,
      successors: []
    })

    const savedChannel = await newChannel.save();
  }

  if ( client.voiceGenerator.get(oldState.channelId) && oldState.channel.members.size === 0 ) {
    await AutoVoices.deleteOne({ channel_id: oldState.channelId })
    
    oldState.channel.delete().catch(() => {})
    
    return;
  }   
})