import { ApplicationCommandType } from "discord.js";
import AutoVoices from "../../schemas/AutoVoices";
import { SlashCommand } from "../../structures/Command";

export default new SlashCommand({
  name: 'voice-open',
  defaultMemberPermissions: 'Connect',
  description: 'Открыть ваш голосовой канал для всех и каждого!',
  type: ApplicationCommandType.ChatInput,
  
  run: async ({ interaction }) => {    
    const { guild } = interaction;
    const currentChannel = interaction.member.voice.channel;   
    const cummandUsed = interaction.member;

    const channel_id = await AutoVoices.findOne({channel_id: currentChannel.id});
    const channel_owner = await AutoVoices.findOne({ channel_id: interaction.member.voice.channel.id });
    
    if (channel_id) {
      if (channel_owner.owner_id === cummandUsed.id) {
        const everyone = guild.roles.everyone;
        const channel_info: any = await AutoVoices.findOne({channel_id: currentChannel.id});
          
        if (channel_info.is_open) {
          await interaction.reply({
            content: `Канал уже является открытым.`,
            ephemeral: true
          })

          return;
        }
        
        await AutoVoices.updateOne({channel_id: currentChannel.id}, {is_open: true})
        currentChannel.permissionOverwrites.edit(everyone, { Connect: true })
    
        await interaction.reply({
          content: `Теперь ${currentChannel} открыт для всех и каждого!`
        })
      } else {
        await interaction.reply({
          content: `Только создатель канала может изгонять участников.`,
          ephemeral: true
        })
      }
    } else {
      currentChannel.delete().catch(() => {});

      await interaction.reply({
        content: `Такого канале не существует :(`,
        ephemeral: true
      })
    }
  }
})