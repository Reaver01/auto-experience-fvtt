// @author Reaver#4634

var addExperience;

Hooks.on('preDeleteCombat', deletedCombat => {
    defeatedEnemies = deletedCombat.turns.filter(object => (!object.actor.isPC && object.defeated && object.token.disposition === -1));
    players = deletedCombat.turns.filter(object => (object.actor.isPC && !object.defeated));
    experience = 0;
    if (defeatedEnemies.length > 0 && addExperience) {
        defeatedEnemies.forEach(enemy => {
            experience += enemy.actor.data.data.details.xp.value;
        });
        if (players.length > 0) {
            dividedExperience = Math.floor(experience / players.length);
            experienceMessage = '<b>Experience Awarded!</b><p><b>' + dividedExperience + '</b> added to:</br>';
            players.forEach(player => {
                index = game.actors.index(player.actor.data._id);
                game.actors.entities[index].update({
                    'data.details.xp.value': player.actor.data.data.details.xp.value + dividedExperience
                });
                experienceMessage += player.actor.data.name + '</br>';
            });
            experienceMessage += '</p>';
            ChatMessage.create({
                user: game.user._id,
                speaker: {
                    actor: this.actor
                },
                content: experienceMessage
            });
        }
    }
});

class NewCombat {
    async endCombat() {
        return new Promise((resolve, reject) => {
            if (!game.user.isGM) {
                reject('You cannot end an active combat');
            }
            new Dialog({
                title: `End Combat?`,
                content: '<p>End this combat encounter and empty the turn tracker?</p>',
                buttons: {
                    yes: {
                        icon: '<i class="fas fa-check"></i>',
                        label: 'End Combat',
                        callback: () => {
                            addExperience = false;
                            this.delete().then(resolve);
                        }
                    },
                    xp: {
                        icon: '<i class="fas fa-check"></i>',
                        label: 'End with XP',
                        callback: () => {
                            addExperience = true;
                            this.delete().then(resolve);
                        }
                    },
                    no: {
                        icon: '<i class="fas fa-times"></i>',
                        label: 'Cancel'
                    }
                },
                default: 'yes'
            }).render(true);
        });
    }
}

Combat.prototype.endCombat = NewCombat.prototype.endCombat;