import DatabaseIcon from '@/src/components/icons/page/DatabaseIcon';
import UserIcon from '@/src/components/icons/page/UserIcon';
import LocationIcon from '@/src/components/icons/page/LocationIcon';
import CalandarCheckIcon from '@/src/components/icons/page/calandarCheck';
import TruckIcon from '@/src/components/icons/page/TruckIcon';
import VehicleNumberIcon from '@/src/components/icons/page/VehicleNumberIcon';
import ClockIcon from '@/src/components/icons/common/ClockIcon';
import PaperRollIcon from '@/src/components/icons/packaging/PaperRollIcon';
import ChamberIcon from '@/src/components/icons/common/ChamberIcon';
import MaleIcon from '@/src/components/icons/common/MaleIcon';
import FemaleIcon from '@/src/components/icons/common/FemaleIcon';
import { DataAccordianEnum } from '../types';
import { getColor } from '../constants/colors';
import CashIcon from '../components/icons/page/CashIcon';
import BoxIcon from '../components/icons/common/BoxIcon';
import LaneIcon from '../components/icons/common/LaneIcon';
import ColorSwatchIcon from '../components/icons/common/ColorSwatchIcon';
import TrashIcon from '../components/icons/common/TrashIcon';
import StarIcon from '../components/icons/page/StarIcon';
import Calendar12Icon from '../components/icons/page/Calendar12Icon';
import UserSquareIcon from '../components/icons/page/UserSquareIcon';
import BagIcon from '../components/icons/packaging/BagIcon';
import BigBagIcon from '../components/icons/packaging/BigBagIcon';
import FileIcon from '../components/icons/common/FileIcon';

export function getIcon(iconName: DataAccordianEnum) {
    switch (iconName) {
        case "database":
            return <DatabaseIcon color={getColor("green", 700)} />;
        case "user":
            return <UserIcon color={getColor("green", 700)} />;
        case "location":
            return <LocationIcon color={getColor("green", 700)} />;
        case "calendar-check":
            return <CalandarCheckIcon color={getColor("green", 700)} />;
        case "chamber":
            return <ChamberIcon color={getColor("green", 700)} />;
        case "package":
            return <PaperRollIcon color={getColor("green", 700)} />;
        case "male":
            return <MaleIcon color={getColor("green", 700)} />;
        case "female":
            return <FemaleIcon color={getColor("green", 700)} />;
        case "money":
            return <CashIcon color={getColor("green", 700)} />;
        case "box":
            return <BoxIcon color={getColor("green", 700)} />;
        case "lane":
            return <LaneIcon color={getColor("green", 700)} />;
        case "color-swatch":
            return <ColorSwatchIcon color={getColor("green", 700)} />;
        case "trash":
            return <TrashIcon color={getColor("green", 700)} size={18} />;
        case "truck":
            return <TruckIcon color={getColor("green", 700)} />;
        case "star":
            return <StarIcon color={getColor("green", 700)} size={18} />;
        case "calendar-year":
            return <Calendar12Icon color={getColor("green", 700)} size={18} />;
        case "truck-num":
            return <VehicleNumberIcon color={getColor("green", 700)} />;
        case "clock":
            return <ClockIcon color={getColor("green", 700)} />;
        case "user-square":
            return <UserSquareIcon color={getColor("green", 700)} />;
        case "paper-roll":
            return <PaperRollIcon color={getColor("green")} />;
        case "bag":
            return <BagIcon color={getColor("green")} />;
        case "big-bag":
            return <BigBagIcon color={getColor("green")} />;
        case "file":
            return <FileIcon color={getColor("green")} />;
        default:
            return null;
    }
};
