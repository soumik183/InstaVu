import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICONS } from '../../utils/icons';

const Icon = ({ 
  name, 
  className = "w-5 h-5", 
  spin = false, 
  pulse = false,
  size,
  color,
  ...props 
}) => {
  // Map our icon constants to Font Awesome icon definitions
  const getFAIcon = (iconName) => {
    const iconMap = {
      [ICONS.UPLOAD]: 'cloud-upload-alt',
      [ICONS.DOWNLOAD]: 'cloud-download-alt',
      [ICONS.SEARCH]: 'search',
      [ICONS.FILTER]: 'filter',
      [ICONS.MENU]: 'bars',
      [ICONS.CLOSE]: 'times',
      [ICONS.GRID]: 'th',
      [ICONS.LIST]: 'list',
      [ICONS.PHOTO]: 'image',
      [ICONS.VIDEO]: 'video',
      [ICONS.DOCUMENT]: 'file',
      [ICONS.FOLDER]: 'folder',
      [ICONS.ALL_FILES]: 'folder-open',
      [ICONS.PLAY]: 'play',
      [ICONS.PAUSE]: 'pause',
      [ICONS.FORWARD]: 'forward',
      [ICONS.BACKWARD]: 'backward',
      [ICONS.VOLUME_ON]: 'volume-up',
      [ICONS.VOLUME_OFF]: 'volume-mute',
      [ICONS.FULLSCREEN]: 'expand',
      [ICONS.EXIT_FULLSCREEN]: 'compress',
      [ICONS.SETTINGS]: 'cog',
      [ICONS.CHECK]: 'check-circle',
      [ICONS.ERROR]: 'exclamation-circle',
      [ICONS.WARNING]: 'exclamation-triangle',
      [ICONS.LOADING]: 'sync',
      [ICONS.CONNECTED]: 'link',
      [ICONS.DISCONNECTED]: 'unlink',
      [ICONS.HEART]: 'heart',
      [ICONS.HEART_OUTLINE]: ['far', 'heart'],
      [ICONS.SHARE]: 'share',
      [ICONS.COPY]: 'copy',
      [ICONS.TRASH]: 'trash',
      [ICONS.EDIT]: 'edit',
      [ICONS.LINK]: 'external-link-alt',
      [ICONS.USER]: 'user',
      [ICONS.EMAIL]: 'envelope',
      [ICONS.LOCK]: 'lock',
      [ICONS.EYE]: 'eye',
      [ICONS.EYE_OFF]: 'eye-slash',
      [ICONS.LOGOUT]: 'sign-out-alt',
      [ICONS.KEY]: 'key',
      [ICONS.ARROW_LEFT]: 'arrow-left',
      [ICONS.ARROW_RIGHT]: 'arrow-right',
      [ICONS.MORE_VERTICAL]: 'ellipsis-v',
      [ICONS.CHEVRON_DOWN]: 'chevron-down',
      [ICONS.CHEVRON_UP]: 'chevron-up',
      [ICONS.PLUS]: 'plus',
      [ICONS.REFRESH]: 'redo',
      [ICONS.POWER]: 'power-off',
      [ICONS.GOOGLE]: ['fab', 'google'],
    };

    return iconMap[iconName] || 'question-circle';
  };

  const iconDefinition = getFAIcon(name);

  return (
    <FontAwesomeIcon 
      icon={iconDefinition}
      className={className}
      spin={spin}
      pulse={pulse}
      {...props}
    />
  );
};

export default Icon;
export { ICONS };