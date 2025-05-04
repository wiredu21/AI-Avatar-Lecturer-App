import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';
import { Tabs, Tab, Box, Typography, Card, CardContent, CardMedia, CardActionArea, Grid, Chip, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';

function UniversityContent() {
  const [value, setValue] = useState(0);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Get university ID (in real app would come from user's profile)
        // For now hardcoding to 1 (University of Northampton)
        const universityId = 1;
        
        const response = await axios.get(`/api/content/university-content/${universityId}/`);
        
        if (response.data) {
          setNews(response.data.latest_news || []);
          setEvents(response.data.latest_events || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching university content:', err);
        setError('Failed to load university content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date unavailable';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format time display for events (e.g., "17:30 - 18:15")
  const formatEventTime = (startTime, endTime) => {
    if (!startTime) return '';
    return endTime ? `${startTime} - ${endTime}` : startTime;
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          University Updates
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={value} onChange={handleChange} aria-label="university content tabs">
            <Tab label="Latest News" id="tab-0" />
            <Tab label="Upcoming Events" id="tab-1" />
          </Tabs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : (
          <Box role="tabpanel" hidden={value !== 0} id="tabpanel-0">
            {value === 0 && (
              <>
                {news.length === 0 ? (
                  <Alert severity="info">No news articles available at the moment.</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {news.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            border: '1px solid #e0e0e0',
                            borderTop: '5px solid #1976d2', // Blue top border to distinguish from events
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 0, flexGrow: 1 }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
                              <Typography 
                                gutterBottom 
                                variant="h6" 
                                component="h2" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  minHeight: '4em'
                                }}
                              >
                                {item.title}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1, 
                                  mb: 1,
                                  fontWeight: 'medium' 
                                }}
                              >
                                <Calendar size={16} />
                                {formatDate(item.published_date)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ p: 2 }}>
                              <Typography 
                                variant="body2" 
                                paragraph 
                                sx={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  height: '4.5em',
                                  mb: 2
                                }}
                              >
                                {item.summary}
                              </Typography>
                              
                              <Box sx={{ mt: 2 }}>
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    color: '#1976d2', 
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  <ExternalLink size={16} />
                                  Read full article
                                </a>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Box>
        )}

        {!loading && !error && (
          <Box role="tabpanel" hidden={value !== 1} id="tabpanel-1">
            {value === 1 && (
              <>
                {events.length === 0 ? (
                  <Alert severity="info">No upcoming events available at the moment.</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {events.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            border: '1px solid #e0e0e0',
                            borderTop: '5px solid #e62878',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          {item.image_url && (
                            <CardMedia
                              component="img"
                              height="140"
                              image={item.image_url}
                              alt={item.title}
                            />
                          )}
                          <CardContent sx={{ p: 0, flexGrow: 1 }}>
                            {/* Event date display */}
                            <Box
                              sx={{
                                display: 'flex',
                                borderBottom: '1px solid #f0f0f0',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  p: 2,
                                  backgroundColor: '#f5f5f5',
                                  width: '100px',
                                  height: '100px'
                                }}
                              >
                                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                                  {item.event_day || new Date(item.published_date).getDate()}
                                </Typography>
                                <Typography variant="subtitle1" component="div" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                                  {item.event_month || new Date(item.published_date).toLocaleString('default', { month: 'short' })}
                                </Typography>
                              </Box>
                              <Box sx={{ p: 2, flexGrow: 1 }}>
                                <Typography gutterBottom variant="h6" component="h2">
                                  {item.title}
                                </Typography>
                                
                                {/* Time */}
                                {(item.event_start_time || item.event_end_time) && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Clock size={16} style={{ marginRight: '8px' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {formatEventTime(item.event_start_time, item.event_end_time)}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {/* Location */}
                                {item.location && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <MapPin size={16} style={{ marginRight: '8px' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {item.location}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            {/* Event summary */}
                            <Box sx={{ p: 2 }}>
                              <Typography variant="body2" paragraph>
                                {item.summary}
                              </Typography>
                              
                              <Box sx={{ mt: 2 }}>
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    color: '#e62878', 
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  <ExternalLink size={16} />
                                  View event details
                                </a>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default UniversityContent; 