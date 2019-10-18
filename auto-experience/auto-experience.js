// @author Reaver#4634

var addExperience;

Hooks.on('preDeleteCombat', (entity, combatId) => {
    DistributeExperience(entity);
});

// Distributes Experience to any living PCs in the combat tracker after ending combat if
// addExperience Toggle has been set true. It adds together any experience from all HOSTILE NPC tokens
// in the tracker, divides it by the number of PCs and adds it to their character sheet.
function DistributeExperience(entity) {
    defeatedEnemies = entity.turns.filter(object => (!object.actor.isPC && object.defeated && object.token.disposition === -1));
    players = entity.turns.filter(object => (object.actor.isPC && !object.defeated));
    experience = 0;
    if (defeatedEnemies.length > 0 && addExperience) {
        defeatedEnemies.forEach(enemy => {
            experience += enemy.actor.data.data.details.xp.value;
        });
        if (players.length > 0) {
            dividedExperience = Math.floor(experience / players.length);
            experienceMessage = '<b>Experience Awarded!</b><p><b>' + dividedExperience + '</b> added to:</br>';
            players.forEach(player => {
                const actor = game.actors.entities.find(actor => actor.id === player.actor.data._id);
                actor.update({
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
}

class Auto5e {
    // Eventually this will be replaced for combatibility.
    // This function replaces Foundry's Native endCombat.
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

// Replace Default endCombat with Auto5e's
Combat.prototype.endCombat = Auto5e.prototype.endCombat;