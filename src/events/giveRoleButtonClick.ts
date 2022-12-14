import RoleButtonId from "../schemas/RoleButtonId";
import VerifyButton from "../schemas/VerifyButton";
import { Event } from "../structures/Event";

export default new Event('interactionCreate', async (interaction: any) => {
  if (!interaction.isButton()) return;

  const customId = interaction.customId
  const button_id_mongo = await RoleButtonId.findOne({button_id: customId});

  if (button_id_mongo) {
    const click_user = interaction.guild.members.cache.get(interaction.member.user.id);
    const role_id = interaction.customId.split('role_btn_')[1];
    const role = interaction.guild.roles.cache.get(role_id);  

    if (click_user.roles.cache.get(role_id)){
      click_user.roles.remove(role);
      interaction.reply({ 
        content: `Роль ${role} убрана.`,
        ephemeral: true
      })
      return;
    }
    
    click_user.roles.add(role);
  
    interaction.reply({ 
      content: `Теперь у вас есть ${role} роль.`,
      ephemeral: true
    });
  }

  if(interaction.customId === "verify_button") {
    const click_user = interaction.guild.members.cache.get(interaction.member.user.id);
    const config = await VerifyButton.find();
    const default_role = interaction.guild.roles.cache.get(config[0].default_role_id); 
    const member_role = interaction.guild.roles.cache.get(config[0].member_role_id);    

    if (click_user.roles.cache.get(config[0].member_role_id)) {
      click_user.roles.remove(member_role);
      await interaction.reply({ 
        content: `Роль ${member_role} убрана.`,
        ephemeral: true
      })
      return;
    }
    
    click_user.roles.add(member_role);
    click_user.roles.add(default_role);
  
    await interaction.reply({ 
      content: `Теперь у вас есть ${member_role} роль`,
      ephemeral: true
    })
    return;
  }
});