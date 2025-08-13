import { FormattedMessage } from '@umijs/max';

export const locationMapping = {
  MX: <FormattedMessage id="mexico" defaultMessage="🇲🇽 Mexico" />,
  HR: <FormattedMessage id="croatia" defaultMessage="🇭🇷 Croatia" />,
  ID: <FormattedMessage id="indonesia" defaultMessage="🇮🇩 Indonesia" />,
  MA: <FormattedMessage id="morocco" defaultMessage="🇲🇦 Morocco" />,
  SA: <FormattedMessage id="saudi_arabia" defaultMessage="🇸🇦 Saudi Arabia" />,
  VE: <FormattedMessage id="venezuela" defaultMessage="🇻🇪 Venezuela" />,
  RO: <FormattedMessage id="romania" defaultMessage="🇷🇴 Romania" />,
  KR: <FormattedMessage id="republic_of_korea" defaultMessage="🇰🇷 Republic of Korea" />,
  FR: <FormattedMessage id="france" defaultMessage="🇫🇷 France" />,
  DE: <FormattedMessage id="germany" defaultMessage="🇩🇪 Germany" />,
  ES: <FormattedMessage id="spain" defaultMessage="🇪🇸 Spain" />,
  HK: <FormattedMessage id="hong_kong" defaultMessage="🇭🇰 中国香港" />,
  TW: <FormattedMessage id="taiwan" defaultMessage="🇹🇼 中国台湾" />,
  CN: <FormattedMessage id="taiwan" defaultMessage="cn 中国" />,
  SG: <FormattedMessage id="singapore" defaultMessage="🇸🇬 Singapore" />,
};

// export const carTypeMap = {
//   month: <FormattedMessage id="platform.month" defaultMessage="Month" />,
//   quarter: <FormattedMessage id="platform.quarter" defaultMessage="Quarter" />,
//   halfYear: <FormattedMessage id="platform.halfYear" defaultMessage="Half Year" />,
//   year: <FormattedMessage id="platform.year" defaultMessage="Year" />,
// };

interface TextObject {
  [key: string]: { text: any };
}

export const convertToTextObject = (obj: Record<string, any>): TextObject => {
  const newObj: TextObject = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = { text: obj[key] };
    }
  }
  return newObj;
};
