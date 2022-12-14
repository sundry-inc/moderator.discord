import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { SlashCommand } from "../../structures/Command";
import isArrayElement from "../../lib/isArrayElement";
import AutoVoices from "../../schemas/AutoVoices";
import CommandChannels from "../../schemas/CommandChannels";

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
    const currentVoice = interaction.member.voice.channel;   
    const currentChannel = interaction.channel;
    const cummandUsed = interaction.member;
    
    const channel_from_db = await AutoVoices.findOne({channel_id: currentVoice.id});
    const successorsArray = channel_from_db.successors; 
    const specialChannelsArray: string[] = await (await CommandChannels.find())
    .map((e) => {
      return e.channel_id
    })
    
    if (!isArrayElement(specialChannelsArray, currentChannel.id)) {
      interaction.reply({
        content: `Используйте специальный канал для войс комманд.`,
        ephemeral: true
      })
      
      return;
    }
    
    if (!channel_from_db) {
      currentVoice.delete().catch(() => {});
      
      await interaction.reply({
        content: `Такого канале не существует :(`,
        ephemeral: true
      });
    }
    
    const canUseCommand: boolean = channel_from_db.owner_id === cummandUsed.id 
      || isArrayElement(successorsArray, cummandUsed.id) 
      || isArrayElement(channel_from_db.admins, cummandUsed.id);

    if (canUseCommand) {
      currentVoice.edit({
        name: `${newName}`
      })
  
      await interaction.reply({
        content: `Имя кана изменено на ${newName}`,
        ephemeral: true
      });        
    } else {
      await interaction.reply({
        content: `Только создатель канала и его приемники могут менять его название.`,
        ephemeral: true
      });
    }

  }
})