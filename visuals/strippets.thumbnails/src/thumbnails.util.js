'use strict';

var _ = require('underscore');

module.exports.flattenIconMap = function (iconMappings) {
    var iconMaps = [];
    _.each(iconMappings, function(icons, entityType) {
        var imap = _.map(icons, function(icon) {
            return { type: entityType, 'class': icon.class, color: icon.color || null, isDefault: icon.isDefault};
        });
        iconMaps = _.union(iconMaps, imap);
    });
    return iconMaps;
};

module.exports.mapEntitiesToIconMap = function(data, iconMap) {
    var concatEntities = function (array, item) { return array.concat(item.entities); };
    var nameAndType = function (entity) { return entity.name + '&' + entity.type; };
    var toEntityReference = function (entityList) {
        return {
            type: entityList[0].type,
            name: entityList[0].name,
            count: entityList.length,
            reverseCount: -entityList.length,
        };
    };
    // process data
    var entityReferences = _.chain(data)
        .reduce(concatEntities, [])
        .groupBy(nameAndType)
        .map(toEntityReference)
        .sortBy('reverseCount')
        .value();

    entityReferences.forEach(function (entity) {
        var entityAlreadyMapped = _.some(iconMap, function (icon) {
            return icon.type === entity.type && entity.name !== undefined && icon.name === entity.name;
        });
        if (!entityAlreadyMapped) {
            var unusedIcon = _.find(iconMap, function(icon) {
                return icon.type === entity.type && icon.name === undefined && !icon.isDefault;
            });
            if (unusedIcon) {
                unusedIcon.name = entity.name;
            }
        }
    });
    return iconMap;
};
