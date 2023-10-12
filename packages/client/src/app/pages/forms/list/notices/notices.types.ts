export type Notice = {
  id: number;
  message: string;
  type: 'new' | 'info' | 'warning' | 'critical' | 'error';
  dateCreated: string;
};
