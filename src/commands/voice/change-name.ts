import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import AutoVoices from "../../schemas/AutoVoices";
import { SlashCommand } from "../../structures/Command";

export default new SlashCommand({
  name: 'voice-name',
  defaultMemberPermissions: 'Connect',
  description: 'Изменить имя вашего канала.',
  type: ApplicationCommandType.ChatInput,

  options: [
    {
      name: "text",
      description: 'Введите новое название для вашего канала.',
      required: true,
      type: ApplicationCommandOptionType.String,
      maxLength: 22
    }
  ],
  
  run: async ({ interaction }) => {
    const newName = interaction.options.get("text").value;
    const currentChannel = interaction.member.voice.channel;   
    const cummandUsed = interaction.member;

    const channel_id = await AutoVoices.findOne({channel_id: currentChannel.id});
    const channel_owner = await AutoVoices.findOne({channel_id: interaction.member.voice.channel.id});
    
    
    if (channel_id) {
      if (channel_owner.owner_id === cummandUsed.id) {
        currentChannel.edit({
          name: `${newName}`
        })
    
        await interaction.reply({
          content: `Имя кана изменено на ${newName}`,
          ephemeral: true
        })        
      } 
      else {
        await interaction.reply({
          content: `Только создатель канала может менять его название.`,
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