'use strict';

module.exports.config = {
    thumbnails: {
        entityIcons: null,
        // icons available for entity mapping. Initialization and loading of data reserves available entities.
        autoGenerateIconMappings: {
            person: [{'class': 'fa fa-male', 'color': '#400000'},
                {'class': 'fa fa-male', 'color': '#d26502'},
                {'class': 'fa fa-male', 'color': '#f0ab21'},
                {'class': 'fa fa-male', 'color': '#9ab3ca'},
                {'class': 'fa fa-male', 'color': '#35364e'},
                {'class': 'fa fa-male', isDefault: true}],
            place: [{'class': 'fa fa-globe', 'color': '#1b2c3f'},
                {'class': 'fa fa-globe', 'color': '#3d697a'},
                {'class': 'fa fa-globe', 'color': '#a68900'},
                {'class': 'fa fa-globe', 'color': '#f4651a'},
                {'class': 'fa fa-globe', 'color': '#fca771'},
                {'class': 'fa fa-globe', isDefault: true}],
            thing: [{'class': 'fa fa-certificate', 'color': '#f9bac4'},
                {'class': 'fa fa-certificate', 'color': '#d2e5eb'},
                {'class': 'fa fa-certificate', 'color': '#91d4d1'},
                {'class': 'fa fa-certificate', 'color': '#e5ab6a'},
                {'class': 'fa fa-certificate', 'color': '#58373e'},
                {'class': 'fa fa-certificate', isDefault: true}],
        },
        infiniteScrollDistance: 10,
    },
    thumbnail: {
        height: 400,
    },
    readerview: {
        readerWidth: 500,
        entityBarWidth: 24, // readerWidth - entityBarWidth = reader content width
        onLoadUrl: null,
    },
};

module.exports.classes = {
    thumbnails: {
        thumbnailsContainer: '.thumbnails-container',
    },
    thumbnail: {
        cardImage: '.card-image',
        title: '.title',
    },
    readerview: {
        readerContainer: '.reader-container',
        buttonContainer: '.button-container',
        readerNextButton: '.reader-next-button',
        readerPrevButton: '.reader-prev-button',
    },
};

module.exports.events = {
    thumbnailClicked: '[Thumbnail::ThumbnailClicked]',
};
