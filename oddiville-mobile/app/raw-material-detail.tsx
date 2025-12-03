import PageHeader from '@/src/components/ui/PageHeader';
import { getColor } from '@/src/constants/colors';
import { StyleSheet, View } from 'react-native';
import RawMaterialCard from '@/src/components/ui/RawMaterialCard';
import { ScrollView } from 'react-native-gesture-handler';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import Tag from '@/src/components/ui/Tag';
import StarIcon from '@/src/components/icons/page/StarIcon';
import { useRoute } from '@react-navigation/native';
import { getImageSource } from '@/src/utils/arrayUtils';

const RawMaterialDetail = () => {
    const route = useRoute();

    const { data, source } = route.params;
    const { id, description, quantity, name, image, rating, chambers, detailByRating } = data;

    return (
      <View style={styles.pageContainer}>
        <PageHeader page={"Chamber"} />
        <View style={styles.wrapper}>
          <View
            style={[
              styles.HStack,
              styles.gap8,
              styles.alignCenter,
              styles.justifyBetween,
            ]}
          >
            <BackButton
              label={name}
              backRoute={
                source === "raw_material"
                  ? "raw-material-overview"
                  : "admin-home"
              }
              backParams={{ screen: source === "chamber" && "Chamber" }}
            />
            <Tag color="green" size="md" style={styles.tag} icon={<StarIcon />}>
              {String(rating)}
            </Tag>
          </View>
          <View style={styles.flexGrow}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardContainerV2}
            >
              {detailByRating?.map((Rmstock: any, index: number) => (
                <RawMaterialCard
                  key={index}
                  id={id}
                  name={name}
                  image={getImageSource(image).image}
                  description={description}
                  rating={"6.0"}
                  detailByRating={[{ rating: "4.0", quantity: "643" }]}
                  color="green"
                  category="material"
                  quantity={name}
                  href="raw-material-detail"
                  disabled={false}
                  chambers={chambers}
                />
              ))}
              {/* <RawMaterialCard
          key={index}
          id="dummy-id"
          name="Dummy Material"
          image="https://dummyimage.com/40x40"
          description="Sample material description"
          rating="4.0"
          detailByRating={[{ rating: "4.0", quantity: "643" }]}
          color="green"
          category="material"
          quantity="643"
          href="raw-material-detail" 
          disabled={false}
          chambers={[
            { id: "gr34", quantity: "100", rating: "4.0" }
          ]}
        /> */}
              {/* <RawMaterialCard key={index} name={name} {...Rmstock} /> */}
            </ScrollView>
          </View>
        </View>
      </View>
    );
}

export default RawMaterialDetail

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
        position: "relative",
    },
    wrapper: {
        flex: 1,
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        padding: 16,
    },
    flexGrow: {
        flex: 1,
        gap: 16,
        paddingTop: 24
    },
    searchinputWrapper: {
        height: 44,
        // marginTop: 24,
        // marginBottom: 24,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.05),
        zIndex: 2,
    },
    tag: {
        alignSelf: 'center',
    },
    cardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingBottom: 20,
    },
    cardContainerV2: {
        flexDirection: 'column',
        gap: 12,
        paddingBottom: 20,
    },
    HStack: {
        flexDirection: "row"
    },
    justifyBetween: {
        justifyContent: "space-between",
    },
    alignCenter: {
        alignItems: "center"
    },
    gap8: {
        gap: 8,
    },
});