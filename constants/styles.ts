import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from './theme';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.base,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  heading1: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.text,
  },
  heading2: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.text,
  },
  heading3: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.text,
  },
  bodyText: {
    fontSize: typography.base,
    color: colors.text,
  },
  secondaryText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
});
