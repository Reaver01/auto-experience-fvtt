// @author Reaver#4634

Hooks.on('deleteCombat', deletedCombat => {
    defeatedEnemies = deletedCombat.turns.filter(object => (!object.actor.isPC && object.defeated && object.token.disposition === -1));
    players = deletedCombat.turns.filter(object => (object.actor.isPC && !object.defeated));
    experience = 0;
    if (defeatedEnemies.length > 0) {
        defeatedEnemies.forEach(enemy => {
            experience += enemy.actor.data.data.details.xp.value;
        });
        if (players.length > 0) {
            dividedExperience = Math.floor(experience / players.length);
            experienceMessage = '<b>Experience Awarded!</b><p><b>' + dividedExperience + '</b> added to:</br>';
            players.forEach(player => {
                index = game.actors.index(player.actor.data._id);
                game.actors.entities[index].update({'data.details.xp.value': player.actor.data.data.details.xp.value + dividedExperience});
                experienceMessage += player.actor.data.name + '</br>';
            });
            experienceMessage += '</p>';
            ChatMessage.create({
                user: game.user._id,
                speaker: { actor: this.actor },
                content: experienceMessage
            });
        }
    }
});